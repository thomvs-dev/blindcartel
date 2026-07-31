/** Parse auction ID from text (padded to 32 bytes) or 64-char hex. */
export function parseAuctionId(input: string): Uint8Array {
  const trimmed = input.trim().replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      out[i] = parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }
  const bytes = new TextEncoder().encode(trimmed);
  const out = new Uint8Array(32);
  out.set(bytes.slice(0, 32));
  return out;
}
