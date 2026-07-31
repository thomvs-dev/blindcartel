/**
 * Auction catalog — product narrative around the live Midnight contract.
 * Only `status: 'live'` maps to the deployed desk; others are upcoming markets.
 * Reveal / settle circuits are deferred — honest empty states on results.
 */

import { parseAuctionId, toHex } from './blind-cartel';

export type AuctionStatus = 'live' | 'upcoming' | 'sealed' | 'waiting';

export type Auction = {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: AuctionStatus;
  closesLabel: string;
  /** Relative countdown hint for live auctions */
  countdownHint: string;
  stakes: string;
  /** String padded into Bytes<32> for the live contract */
  auctionKey: string;
  /** Whether seal circuit is wired for this auction */
  canSeal: boolean;
  /** Reveal/settle not yet on contract — results show honest empty */
  revealAvailable: boolean;
};

export const AUCTIONS: Auction[] = [
  {
    id: 'fraud-intel-q3',
    title: 'Fraud intel Q3',
    summary:
      'Sealed contributions for Q3 fraud-signal packs. Amounts stay in witness; only commitments hit the registry.',
    category: 'Risk intel',
    status: 'live',
    closesLabel: 'Open now',
    countdownHint: 'Sealing window open',
    stakes: 'Sets the default for how private intel markets report participation.',
    auctionKey: 'fraud-intel-q3',
    canSeal: true,
    revealAvailable: false,
  },
  {
    id: 'sanctions-shadow',
    title: 'Sanctions shadow map',
    summary: 'Anonymous bids on cross-border sanctions adjacency graphs for the next review window.',
    category: 'Compliance',
    status: 'upcoming',
    closesLabel: 'Opens next cycle',
    countdownHint: 'Not open yet',
    stakes: 'Separates contribution privacy from public market presence.',
    auctionKey: 'sanctions-shadow',
    canSeal: false,
    revealAvailable: false,
  },
  {
    id: 'shell-network',
    title: 'Shell network atlas',
    summary: 'Market for sealed tips on nested shell company graphs without naming the tipster.',
    category: 'Corporate',
    status: 'upcoming',
    closesLabel: 'Drafting',
    countdownHint: 'Drafting',
    stakes: 'Keeps source identity dark while the board stays auditable.',
    auctionKey: 'shell-network',
    canSeal: false,
    revealAvailable: false,
  },
  {
    id: 'pilot-seal',
    title: 'Pilot seal (archive)',
    summary: 'Closed pilot that validated sealed bids under preview load.',
    category: 'Archive',
    status: 'sealed',
    closesLabel: 'Sealed',
    countdownHint: 'Window closed',
    stakes: 'Reference market for auditors and newcomers.',
    auctionKey: 'pilot-seal',
    canSeal: false,
    revealAvailable: false,
  },
];

export function liveAuction(): Auction {
  return AUCTIONS.find((a) => a.status === 'live') ?? AUCTIONS[0];
}

export function auctionById(id: string): Auction | undefined {
  return AUCTIONS.find((a) => a.id === id);
}

export function auctionIdBytes(auction: Auction): Uint8Array {
  return parseAuctionId(auction.auctionKey);
}

export function auctionIdHex(auction: Auction): string {
  return toHex(auctionIdBytes(auction));
}

/** Match a registry auctionId hex to a friendly preset when possible. */
export function labelForAuctionHex(hex: string): string {
  const normalized = hex.trim().replace(/^0x/i, '').toLowerCase();
  for (const auction of AUCTIONS) {
    if (auctionIdHex(auction) === normalized) return auction.title;
  }
  if (normalized.length <= 18) return normalized;
  return `${normalized.slice(0, 10)}…${normalized.slice(-6)}`;
}

export function statusLabel(status: AuctionStatus): string {
  switch (status) {
    case 'live':
      return 'Open';
    case 'upcoming':
      return 'Upcoming';
    case 'waiting':
      return 'Waiting';
    case 'sealed':
      return 'Closed';
  }
}
