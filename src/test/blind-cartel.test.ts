import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  deployContract,
  submitCallTx,
} from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import pino from 'pino';

import { getConfig } from '../config.js';
import {
  MidnightWalletProvider,
  GENESIS_WALLET_SEED,
  syncWallet,
} from '../wallet.js';
import { buildProviders, type BlindCartelProviders } from '../providers.js';
import {
  CompiledBlindCartelContract,
  ledger,
  pureCircuits,
  zkConfigPath,
} from '../../contracts/index.js';
import { createInitialPrivateState } from '../../contracts/witnesses.js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const ALICE_SEED = GENESIS_WALLET_SEED;
const ALICE_PRIVATE_STATE_ID = 'AliceBlindCartelState';

const BIDDER_SECRET = new Uint8Array(32).fill(0x01);
const BID_AMOUNT = new Uint8Array(32).fill(0x02);
const AUCTION_ID = new Uint8Array(32).fill(0xaa);

const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  transport: { target: 'pino-pretty' },
});

describe('Blind Cartel Contract', () => {
  let aliceWallet: MidnightWalletProvider;
  let aliceProviders: BlindCartelProviders;
  let contractAddress: ContractAddress;
  let expectedBidCommitment: Uint8Array;

  const config = getConfig();

  async function queryLedger(providers: BlindCartelProviders) {
    const state =
      await providers.publicDataProvider.queryContractState(contractAddress);
    expect(state).not.toBeNull();
    return ledger(state!.data);
  }

  beforeAll(async () => {
    setNetworkId(config.networkId);

    expectedBidCommitment = pureCircuits.bidCommitment(
      AUCTION_ID,
      BIDDER_SECRET,
      BID_AMOUNT,
    );

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

    aliceWallet = await MidnightWalletProvider.build(
      logger,
      envConfig,
      ALICE_SEED,
    );
    await aliceWallet.start();
    await syncWallet(logger, aliceWallet.wallet, 600_000);

    aliceProviders = buildProviders(aliceWallet, zkConfigPath, config);
    logger.info('Providers initialized. Ready to test!');
  });

  afterAll(async () => {
    if (aliceWallet) {
      logger.info('Stopping Alice wallet...');
      await aliceWallet.stop();
    }
  });

  it('deploys the contract', async () => {
    const deployed: any = await (deployContract as any)(aliceProviders, {
      compiledContract: CompiledBlindCartelContract,
      privateStateId: ALICE_PRIVATE_STATE_ID,
      initialPrivateState: createInitialPrivateState(
        BIDDER_SECRET,
        BID_AMOUNT,
      ),
      args: [],
    });

    contractAddress = deployed.deployTxData.public.contractAddress;
    logger.info(`Contract deployed at: ${contractAddress}`);
    expect(contractAddress).toBeDefined();
    expect(contractAddress.length).toBeGreaterThan(0);

    const state = await queryLedger(aliceProviders);
    expect(state.nextBidId).toEqual(0n);
  });

  it('submits a sealed bid with disclosed commitment only', async () => {
    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledBlindCartelContract,
      contractAddress,
      privateStateId: ALICE_PRIVATE_STATE_ID,
      circuitId: 'submitSealedBid',
      args: [AUCTION_ID],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.nextBidId).toEqual(1n);
    expect(state.sealedBids.member(expectedBidCommitment)).toBe(true);

    const entry = state.sealedBids.lookup(expectedBidCommitment);
    expect(entry.auctionId).toEqual(AUCTION_ID);
    expect(entry.bidderCommitment).toEqual(
      pureCircuits.bidderCommitment(BIDDER_SECRET),
    );
  });

  it('proves bidder ownership without revealing bid amount', async () => {
    await (submitCallTx as any)(aliceProviders, {
      compiledContract: CompiledBlindCartelContract,
      contractAddress,
      privateStateId: ALICE_PRIVATE_STATE_ID,
      circuitId: 'proveBidOwnership',
      args: [expectedBidCommitment],
    });

    const state = await queryLedger(aliceProviders);
    expect(state.sealedBids.member(expectedBidCommitment)).toBe(true);
  });
});
