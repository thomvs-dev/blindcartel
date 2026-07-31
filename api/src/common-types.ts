import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { blindCartelPrivateStateKey } from '../../contracts/constants.js';
import type { BlindCartelPrivateState } from '../../contracts/witnesses.js';

export { blindCartelPrivateStateKey };

export type BlindCartelCircuitKeys = 'submitSealedBid' | 'proveBidOwnership';
export type BlindCartelProviders = MidnightProviders<
  BlindCartelCircuitKeys,
  typeof blindCartelPrivateStateKey,
  BlindCartelPrivateState
>;
export type DeployedBlindCartelContract = FoundContract<any>;

export type SealedBidEntryView = {
  bidCommitment: string;
  auctionId: string;
  bidderCommitment: string;
};

export type RegistryState = {
  bidCount: number;
  entries: SealedBidEntryView[];
};
