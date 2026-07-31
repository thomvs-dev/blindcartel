import { fromHex } from '@midnight-ntwrk/compact-runtime';

/** Parse auction ID from text (padded to 32 bytes) or 64-char hex. */
export function parseAuctionId(input: string): Uint8Array {
  const trimmed = input.trim().replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return fromHex(trimmed);
  }
  const bytes = new TextEncoder().encode(trimmed);
  const out = new Uint8Array(32);
  out.set(bytes.slice(0, 32));
  return out;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function bidCommitmentFromHex(hex: string): Uint8Array {
  const trimmed = hex.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error('Bid commitment must be 64 hex characters.');
  }
  return fromHex(trimmed);
}
