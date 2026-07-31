import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import pino from 'pino';
import { readFileSync } from 'node:fs';

import { getConfig } from './config.js';
import {
  MidnightWalletProvider,
  GENESIS_WALLET_SEED,
  syncWallet,
} from './wallet.js';
import { buildProviders } from './providers.js';
import {
  CompiledBlindCartelContract,
  ledger,
  pureCircuits,
  zkConfigPath,
} from '../contracts/index.js';
import { createInitialPrivateState } from '../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

const BIDDER_SECRET = new Uint8Array(32).fill(0x31);
const BID_AMOUNT = new Uint8Array(32).fill(0x32);
const AUCTION_ID = new Uint8Array(32).fill(0xbb);
const PRIVATE_STATE_ID = 'SmokeBlindCartelState';

async function main() {
  const deployment = JSON.parse(readFileSync('./deployment.json', 'utf8')) as {
    contractAddress: string;
  };
  const contractAddress = deployment.contractAddress;
  const config = getConfig();
  setNetworkId(config.networkId);

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const wallet = await MidnightWalletProvider.build(
    logger,
    envConfig,
    GENESIS_WALLET_SEED,
  );
  await wallet.start();
  await syncWallet(logger, wallet.wallet, 600_000);
  const providers = buildProviders(wallet, zkConfigPath, config);
  const initialPrivateState = createInitialPrivateState(
    BIDDER_SECRET,
    BID_AMOUNT,
  );
  await providers.privateStateProvider.setContractAddress(contractAddress);
  await providers.privateStateProvider.set(
    PRIVATE_STATE_ID,
    initialPrivateState,
  );

  const expected = pureCircuits.bidCommitment(
    AUCTION_ID,
    BIDDER_SECRET,
    BID_AMOUNT,
  );

  logger.info({ contractAddress }, 'Calling submitSealedBid');
  await (submitCallTx as any)(providers, {
    compiledContract: CompiledBlindCartelContract,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    circuitId: 'submitSealedBid',
    args: [AUCTION_ID],
  });

  const state =
    await providers.publicDataProvider.queryContractState(contractAddress);
  const l = ledger(state!.data);
  logger.info(
    {
      member: l.sealedBids.member(expected),
      nextBidId: String(l.nextBidId),
    },
    'After submit',
  );

  logger.info('Calling proveBidOwnership');
  await (submitCallTx as any)(providers, {
    compiledContract: CompiledBlindCartelContract,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    circuitId: 'proveBidOwnership',
    args: [expected],
  });

  logger.info('Smoke OK');
  await wallet.stop();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
