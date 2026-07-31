import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { witnesses } from './witnesses.js';
import { Contract } from './managed/blind-cartel/contract/index.js';

/** Browser — relative asset path resolved by FetchZkConfigProvider. */
export const CompiledBlindCartelContract = CompiledContract.make(
  'BlindCartelContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('./managed/blind-cartel'),
);

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/blind-cartel/contract/index.js';
