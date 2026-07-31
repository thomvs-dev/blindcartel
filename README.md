# Blind Cartel

Industry-specific AI intelligence network on [Midnight Network](https://midnight.network). Competing companies contribute private data signals (inventory, pricing, churn, fraud patterns) to shared AI agents. ZK proofs verify each contribution is valid without revealing raw data.

**Level 2 focus:** Vite + React dApp with storyline landing, Lace/1AM wallet connect, local undeployed deploy/join, and sealed-bid circuit calls from the UI.

## Privacy claim

Bid amounts and bidder secrets stay in local witness / private state. On-chain and indexer-visible data are limited to:

- bid commitment hash
- auction ID
- bidder commitment

An observer can see that a sealed bid exists for an auction. They cannot recover the bid amount or raw signal from chain state alone.

## Prerequisites

- **Node.js 22+** (`nvm use 22`)
- **Docker** (local devnet + proof server)
- **Compact compiler** 0.31.1
- **Yarn 1.22**
- **Lace** or **1AM** Midnight wallet extension (for the web desk)

### Install Compact

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source $HOME/.local/bin/env
compact update 0.31.1
compact compile --version
```

## Setup (contract + local network)

```bash
nvm use 22
yarn install
yarn compile
yarn env:up
yarn test:local
```

If port 6300 is in use, `yarn env:up` starts node + indexer only; keep a proof server on `http://127.0.0.1:6300`.

## Deploy (undeployed)

```bash
yarn env:up
yarn deploy:undeployed
```

Uses the pre-funded genesis wallet on local devnet. Address is written to [`deployment.json`](deployment.json).

Current undeployed address: `9550de42a7f1a4239c271719a00004c03890caa32874e06c9b8b5bd2d6276891`.

Preprod is out of scope for this Level 2 drop.

## Frontend (Level 2)

```bash
nvm use 22
yarn web:install
yarn sync:zk
yarn web:dev
```

Open `http://127.0.0.1:3000`:

- `/` storyline landing
- `/app` auction desk: connect wallet on `undeployed`, deploy or join, call `submitSealedBid` / `proveBidOwnership`, inspect privacy panel + public registry

Wallet connect uses `window.midnight.mnLace` (or the first detected Midnight wallet), then `connect('undeployed')`. Disconnect calls the wallet API when available.

Build the web bundle:

```bash
yarn web:build
# or full: yarn build
```

`yarn sync:zk` copies `contracts/managed/blind-cartel` into `web/public/zk/blind-cartel` for `FetchZkConfigProvider`.

## Public state vs private witness

| Data | Visibility | Stored where |
|------|------------|--------------|
| Bid amount (signal quality score) | **Private** | Witness + local private state |
| Bidder secret | **Private** | Witness only |
| Bid commitment `persistentHash(auction, bidder, amount)` | **Public** | On-chain `sealedBids` map key |
| Auction ID | **Public** | `SealedBidEntry.auctionId` |
| Bidder commitment | **Public** | `SealedBidEntry.bidderCommitment` |

## Circuits

- `submitSealedBid(auctionId)` — hash witnesses, disclose commitment + auction metadata
- `proveBidOwnership(bidCommitment)` — bidder ZK auth without revealing amount

## Project structure

```
contracts/
  blind-cartel.compact
  witnesses.ts
  managed/blind-cartel/
src/
  test/blind-cartel.test.ts
  deploy.ts
web/
  src/pages/LandingPage.tsx
  src/pages/AppPage.tsx
  src/lib/midnight.ts
  src/lib/blind-cartel.ts
  public/zk/blind-cartel/
scripts/
  sync-zk-assets.mjs
```

## Toolchain versions

| Component | Version |
|-----------|---------|
| compact | 0.31.1 |
| compact-runtime | 0.16.0 |
| compact-js | 2.5.0 |
| midnight-js | 4.0.4 |
| ledger-v8 | 8.0.3 |

## License

MIT
