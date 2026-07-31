import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';

export type BlindCartelPrivateState = {
  bidderSecret: Uint8Array;
  bidAmount: Uint8Array;
};

export const witnesses = {
  bidderSecret: (context: WitnessContext<BlindCartelPrivateState>) =>
    [context.privateState, context.privateState.bidderSecret] as const,
  bidAmount: (context: WitnessContext<BlindCartelPrivateState>) =>
    [context.privateState, context.privateState.bidAmount] as const,
};

export function createInitialPrivateState(
  bidderSecret: Uint8Array,
  bidAmount: Uint8Array,
): BlindCartelPrivateState {
  return { bidderSecret, bidAmount };
}
