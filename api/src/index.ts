/**
 * Shared Blind Cartel contract API — browser (1AM / Lace) and CLI.
 */
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  ContractState,
  fromHex,
  type ContractAddress,
} from '@midnight-ntwrk/compact-runtime';

import {
  CompiledBlindCartelContract,
  ledger,
  pureCircuits,
} from '../../contracts/compiled.js';
import {
  createInitialPrivateState,
  type BlindCartelPrivateState,
} from '../../contracts/witnesses.js';
import {
  blindCartelPrivateStateKey,
  type BlindCartelProviders,
  type DeployedBlindCartelContract,
  type RegistryState,
  type SealedBidEntryView,
} from './common-types.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class BlindCartelAPI {
  readonly contractAddress: ContractAddress;

  private constructor(
    private readonly deployedContract: DeployedBlindCartelContract,
    private readonly providers: BlindCartelProviders,
  ) {
    this.contractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.contractAddress);
  }

  async submitSealedBid(auctionId: Uint8Array): Promise<void> {
    await (this.deployedContract as any).callTx.submitSealedBid(auctionId);
  }

  async proveBidOwnership(targetBidCommitment: Uint8Array): Promise<void> {
    await (this.deployedContract as any).callTx.proveBidOwnership(targetBidCommitment);
  }

  static commitmentPreviews(
    privateState: BlindCartelPrivateState,
    auctionId: Uint8Array,
  ) {
    return {
      bidderCommitment: bytesToHex(pureCircuits.bidderCommitment(privateState.bidderSecret)),
      bidCommitment: bytesToHex(
        pureCircuits.bidCommitment(auctionId, privateState.bidderSecret, privateState.bidAmount),
      ),
    };
  }

  static decodeRegistryState(stateHex: string, networkId?: NetworkId): RegistryState {
    if (networkId !== undefined) {
      setNetworkId(networkId);
    }
    const contractState = ContractState.deserialize(fromHex(stateHex));
    const l = ledger(contractState.data);
    const entries: SealedBidEntryView[] = [];

    for (const [key, entry] of l.sealedBids) {
      entries.push({
        bidCommitment: bytesToHex(key),
        auctionId: bytesToHex(entry.auctionId),
        bidderCommitment: bytesToHex(entry.bidderCommitment),
      });
    }

    return {
      bidCount: Number(l.nextBidId as unknown as bigint),
      entries,
    };
  }

  static async fetchRegistryState(
    queryUrl: string,
    contractAddress: string,
    networkId?: NetworkId,
  ): Promise<RegistryState> {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        variables: { address: contractAddress },
      }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((e: { message: string }) => e.message).join('; '));
    }
    const hex = payload.data?.contractAction?.state ?? null;
    if (!hex) return { bidCount: 0, entries: [] };
    return BlindCartelAPI.decodeRegistryState(hex, networkId);
  }

  static async deploy(
    providers: BlindCartelProviders,
    privateState: BlindCartelPrivateState,
  ): Promise<BlindCartelAPI> {
    const deployedContract = await (deployContract as any)(providers, {
      compiledContract: CompiledBlindCartelContract,
      privateStateId: blindCartelPrivateStateKey,
      initialPrivateState: privateState,
      args: [],
    });
    return new BlindCartelAPI(deployedContract, providers);
  }

  static async join(
    providers: BlindCartelProviders,
    contractAddress: ContractAddress,
    privateState: BlindCartelPrivateState,
    compiledContract: typeof CompiledBlindCartelContract = CompiledBlindCartelContract,
  ): Promise<BlindCartelAPI> {
    const deployedContract = await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract,
      privateStateId: blindCartelPrivateStateKey,
      initialPrivateState: privateState,
    });
    return new BlindCartelAPI(deployedContract, providers);
  }
}

export * from './common-types.js';
