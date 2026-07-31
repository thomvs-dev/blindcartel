import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import { BlindCartelAPI } from '../api/src/node.js';
import { CompiledBlindCartelContract, zkConfigPath } from '../contracts/index.js';
import { getConfig } from './config.js';
import { ensureDust } from './dust.js';
import { createProviders } from './providers.js';
import {
  createWallet,
  resolveDeploySeed,
  unshieldedToken,
  waitForSyncedWallet,
} from './wallet.js';
import { createInitialPrivateState } from '../contracts/witnesses.js';
import { parseAuctionId } from './parse-auction-id.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const BIDDER_SECRET = new Uint8Array(32).fill(0x0a);
const BID_AMOUNT = new Uint8Array(32).fill(0x0b);

type DeploymentRecord = {
  network: string;
  contractAddress: string;
  deployedAt: string;
};

function loadDeployment(): DeploymentRecord {
  const path = resolve(process.cwd(), 'deployment.json');
  if (!existsSync(path)) {
    throw new Error('No deployment.json found. Run npm run deploy:preview first.');
  }
  return JSON.parse(readFileSync(path, 'utf8')) as DeploymentRecord;
}

async function main() {
  const deployment = loadDeployment();
  if (!process.env['MIDNIGHT_NETWORK']) {
    process.env['MIDNIGHT_NETWORK'] =
      deployment.network === 'undeployed' ? 'local' : deployment.network;
  }

  const config = getConfig();
  const seed = resolveDeploySeed(config.networkId);
  setNetworkId(config.networkId);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                 Blind Cartel CLI                             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Contract: ${deployment.contractAddress}`);
  console.log(`  Network:  ${config.networkId}`);
  console.log('');

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log('  Connecting to wallet...');
    const walletCtx = await createWallet(config, seed);
    console.log('  Syncing with network...');
    await waitForSyncedWallet(walletCtx.wallet, 600_000);
    console.log('  ✓ Synced\n');

    const state = await walletCtx.wallet.waitForSyncedState();
    console.log(`  Balance: ${(state.unshielded.balances[unshieldedToken().raw] ?? 0n).toLocaleString()} tNight`);
    console.log(`  DUST:    ${state.dust.balance(new Date()).toLocaleString()}\n`);

    await ensureDust(walletCtx);

    const privateState = createInitialPrivateState(BIDDER_SECRET, BID_AMOUNT);
    const providers = createProviders(walletCtx, zkConfigPath, config, 'cli');
    const api = await BlindCartelAPI.join(
      providers,
      deployment.contractAddress,
      privateState,
      CompiledBlindCartelContract,
    );

    let running = true;
    while (running) {
      console.log('─── Menu ───────────────────────────────────────────────────────');
      console.log('  1. Submit sealed bid');
      console.log('  2. Prove bid ownership');
      console.log('  3. Show registry state');
      console.log('  4. Exit\n');

      const choice = await rl.question('  Your choice: ');

      switch (choice.trim()) {
        case '1': {
          const auctionStr = await rl.question('  Auction ID (text or 64 hex): ');
          const auctionId = parseAuctionId(auctionStr);
          const previews = BlindCartelAPI.commitmentPreviews(privateState, auctionId);
          console.log(`\n  bidCommitment preview: ${previews.bidCommitment}`);
          console.log('  Submitting submitSealedBid...');
          try {
            await api.submitSealedBid(auctionId);
            console.log('\n  ✅ Sealed bid submitted\n');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }
        case '2': {
          const bidHex = await rl.question('  Target bid commitment (64 hex): ');
          console.log('\n  Submitting proveBidOwnership...');
          try {
            const trimmed = bidHex.trim().replace(/^0x/i, '');
            const bytes = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
              bytes[i] = parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
            }
            await api.proveBidOwnership(bytes);
            console.log('\n  ✅ Ownership proven\n');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }
        case '3': {
          try {
            const registry = await BlindCartelAPI.fetchRegistryState(
              config.indexer,
              deployment.contractAddress,
              config.networkId as any,
            );
            console.log('\n  📊 Registry');
            console.log(`  nextBidId ≈ ${registry.bidCount}`);
            for (const entry of registry.entries) {
              console.log(`  - bid ${entry.bidCommitment.slice(0, 16)}… auction ${entry.auctionId.slice(0, 16)}…`);
            }
            console.log('');
          } catch (error) {
            console.error('\n  ❌ Failed:', error instanceof Error ? error.message : error, '\n');
          }
          break;
        }
        case '4':
          running = false;
          break;
        default:
          console.log('\n  ❌ Invalid choice.\n');
      }
    }

    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main().catch(console.error);
