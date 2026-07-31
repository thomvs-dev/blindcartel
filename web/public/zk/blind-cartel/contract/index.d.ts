import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  bidderSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  bidAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveBidOwnership(context: __compactRuntime.CircuitContext<PS>,
                    targetBidCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveBidOwnership(context: __compactRuntime.CircuitContext<PS>,
                    targetBidCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  bidderCommitment(sk_0: Uint8Array): Uint8Array;
  bidCommitment(auctionId_0: Uint8Array, sk_0: Uint8Array, amount_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  bidderCommitment(context: __compactRuntime.CircuitContext<PS>,
                   sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  bidCommitment(context: __compactRuntime.CircuitContext<PS>,
                auctionId_0: Uint8Array,
                sk_0: Uint8Array,
                amount_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitSealedBid(context: __compactRuntime.CircuitContext<PS>,
                  auctionId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveBidOwnership(context: __compactRuntime.CircuitContext<PS>,
                    targetBidCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  sealedBids: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { auctionId: Uint8Array,
                                 bidderCommitment: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { auctionId: Uint8Array, bidderCommitment: Uint8Array }]>
  };
  readonly nextBidId: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
