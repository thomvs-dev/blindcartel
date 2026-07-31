/**
 * Browser provider setup — mirrors voidballot BrowserVoidBallotManager.
 */
import {
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  take,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import semver from 'semver';
import type { Logger } from 'pino';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  Binding,
  type FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  type TransactionId,
} from '@midnight-ntwrk/ledger-v8';
import { fromHex, toHex } from '@midnight-ntwrk/compact-runtime';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

import {
  BlindCartelAPI,
  type BlindCartelCircuitKeys,
  type BlindCartelProviders,
} from '../../../api/src/index.js';
import {
  createInitialPrivateState,
  type BlindCartelPrivateState,
} from '@contracts/witnesses.js';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider.js';
import { NETWORK_ID, ZK_ASSET_ORIGIN } from '../config.js';

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';
const SECRET_STORAGE_KEY = 'blind-cartel-secrets';

export function getOrCreateSecrets(): BlindCartelPrivateState {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as {
      bidderSecret: number[];
      bidAmount: number[];
    };
    return createInitialPrivateState(
      new Uint8Array(parsed.bidderSecret),
      new Uint8Array(parsed.bidAmount),
    );
  }
  const bidderSecret = crypto.getRandomValues(new Uint8Array(32));
  const bidAmount = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(
    SECRET_STORAGE_KEY,
    JSON.stringify({
      bidderSecret: Array.from(bidderSecret),
      bidAmount: Array.from(bidAmount),
    }),
  );
  return createInitialPrivateState(bidderSecret, bidAmount);
}

export function rotateSecrets(): BlindCartelPrivateState {
  localStorage.removeItem(SECRET_STORAGE_KEY);
  return getOrCreateSecrets();
}

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  const midnight = (window as any).midnight;
  if (!midnight) return undefined;
  return Object.values(midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(String((wallet as InitialAPI).apiVersion), COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

const connectToWallet = (networkId: string): Promise<ConnectedAPI> =>
  firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getFirstCompatibleWallet()),
      filter((api): api is InitialAPI => !!api),
      take(1),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => new Error('No Midnight wallet found. Install Lace or 1AM.')),
      }),
      concatMap(async (initialAPI) => initialAPI.connect(networkId)),
      timeout({
        first: 15_000,
        with: () => throwError(() => new Error('Wallet failed to connect.')),
      }),
      catchError((error) =>
        throwError(() => (error instanceof Error ? error : new Error('Wallet not authorized'))),
      ),
    ),
  );

async function initializeProviders(logger: Logger): Promise<{
  providers: BlindCartelProviders;
  connectedAPI: ConnectedAPI;
  unshieldedAddress: string;
}> {
  setNetworkId(NETWORK_ID as NetworkId);

  const connectedAPI = await connectToWallet(NETWORK_ID);
  const config = await connectedAPI.getConfiguration();
  const proofServerUri = config.proverServerUri;
  if (!proofServerUri) {
    throw new Error('Wallet did not provide a proof server URI.');
  }

  logger.info({ proofServerUri, networkId: config.networkId }, 'Wallet configuration');

  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  const unshielded = await connectedAPI.getUnshieldedAddress();
  const zkConfigProvider = new FetchZkConfigProvider<BlindCartelCircuitKeys>(
    ZK_ASSET_ORIGIN,
    fetch.bind(window),
  );

  const providers = {
    privateStateProvider: inMemoryPrivateStateProvider(),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
        const received = await connectedAPI.balanceUnsealedTransaction(toHex(tx.serialize()));
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          'signature',
          'proof',
          'binding',
          fromHex(received.tx),
        );
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  } as BlindCartelProviders;

  return {
    providers,
    connectedAPI,
    unshieldedAddress: unshielded.unshieldedAddress,
  };
}

export class BrowserBlindCartelManager {
  #providersPromise: ReturnType<typeof initializeProviders> | undefined;
  #apiPromise: Map<string, Promise<BlindCartelAPI>> = new Map();

  constructor(private readonly logger: Logger) {}

  private getProviders() {
    return this.#providersPromise ?? (this.#providersPromise = initializeProviders(this.logger));
  }

  async join(contractAddress: string): Promise<BlindCartelAPI> {
    const existing = this.#apiPromise.get(contractAddress);
    if (existing) return existing;

    const promise = (async () => {
      const { providers } = await this.getProviders();
      return BlindCartelAPI.join(providers, contractAddress, getOrCreateSecrets());
    })();

    this.#apiPromise.set(contractAddress, promise);
    return promise;
  }

  async submitSealedBid(contractAddress: string, auctionId: Uint8Array): Promise<void> {
    const api = await this.join(contractAddress);
    await api.submitSealedBid(auctionId);
  }

  async proveBidOwnership(
    contractAddress: string,
    targetBidCommitment: Uint8Array,
  ): Promise<void> {
    const api = await this.join(contractAddress);
    await api.proveBidOwnership(targetBidCommitment);
  }

  async getSession(): Promise<{
    unshieldedAddress: string;
    connectedAPI: ConnectedAPI;
  }> {
    const session = await this.getProviders();
    return {
      unshieldedAddress: session.unshieldedAddress,
      connectedAPI: session.connectedAPI,
    };
  }

  async disconnect(): Promise<void> {
    const session = await this.#providersPromise;
    if (session) {
      await (session.connectedAPI as { disconnect?: () => Promise<void> }).disconnect?.();
    }
    this.#providersPromise = undefined;
    this.#apiPromise.clear();
  }
}

export function friendlyError(error: unknown): string {
  const msg = extractErrorMessage(error);
  if (msg.includes('User rejected')) return 'You cancelled in the wallet.';
  if (msg.includes('bid already sealed')) return 'That contribution is already sealed on the board.';
  if (msg.includes('bid not found')) return 'That seal isn’t on the market board yet. Refresh and try again.';
  if (msg.includes('not the bidder')) return 'This browser’s secret doesn’t match that seal.';
  if (msg.includes('No private state found')) {
    return 'Session wasn’t ready. Reconnect your wallet and try again.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('Failed Proof Server')) {
    return 'Couldn’t reach the proof server. Check wallet network settings and try again.';
  }
  if (msg.includes('not authorized')) return 'Wallet connection was declined.';
  if (msg.includes('No Midnight wallet')) {
    return 'No Midnight wallet found. Install Lace or 1AM, then try again.';
  }
  if (msg.includes('insufficient') || msg.includes('DUST')) {
    return 'Wallet needs more DUST. Fund from the preview faucet, then retry.';
  }
  return msg || 'Something went wrong. Try again in a moment.';
}

function extractErrorMessage(error: unknown): string {
  if (!error) return '';
  if (error instanceof Error && error.message) return error.message;
  const e = error as { cause?: { failure?: { message?: string; cause?: { message?: string } }; message?: string } };
  if (e.cause?.failure?.message) return e.cause.failure.message;
  if (e.cause?.failure?.cause?.message) return e.cause.failure.cause.message;
  if (e.cause?.message) return e.cause.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export { BlindCartelAPI };
