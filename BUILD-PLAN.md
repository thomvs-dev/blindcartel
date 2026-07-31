# Blind Cartel — Build Plan

## Level 1 — New Moon

**Scope:** Sealed-bid registry contract — private bid amount witness, public commitment map.

| Deliverable | Status |
|-------------|--------|
| Compact contract (`submitSealedBid`, `proveBidOwnership`) | Done |
| `managed/` compile artifacts | Done |
| Vitest deploy + circuit tests | Done |
| `deployment.json` | Done (undeployed) |
| README (idea, setup, privacy model) | Done |

## Level 2 — Waxing Crescent

| Deliverable | Status |
|-------------|--------|
| Vite + React product shell (shared Midnight pattern) | Done |
| Full-bleed steel/cyan landing + Space Grotesk / IBM Plex | Done |
| Routes: home → auctions → seal → results + activity/profile/settings | Done |
| Lace/1AM Connect + TxFlow only overt web3 | Done |
| Multi-auction catalog; one live market → current contract | Done |
| Cartel clearance + season seals (local) | Done |
| Reveal / settle circuits | Deferred — honest empty states on results |
| Preprod / preview deploy | Per network config |

## Level 3 — First Quarter

- Bid reveal phase circuit
- Settle / winner flow
- Full sealed-bid auction: commit → reveal → winner

## Level 4+ — Fraud intelligence network

- Multi-insurer signal aggregation
- ZK attestation of signal quality
- Governance token rewards proportional to verified contributions
