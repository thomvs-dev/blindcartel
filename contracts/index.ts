import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { witnesses } from './witnesses.js';
import { Contract } from './managed/blind-cartel/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, 'managed', 'blind-cartel');

/** Node CLI / deploy — absolute asset path for NodeZkConfigProvider. */
export const CompiledBlindCartelContract = CompiledContract.make(
  'BlindCartelContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/blind-cartel/contract/index.js';
export { blindCartelPrivateStateKey } from './constants.js';
export { witnesses, createInitialPrivateState, type BlindCartelPrivateState } from './witnesses.js';
