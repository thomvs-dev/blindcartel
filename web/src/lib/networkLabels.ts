import { NETWORK_ID } from '../config';

/** Friendly labels for Midnight network ids — never show raw chain jargon by default. */
export function networkLabel(id: string = NETWORK_ID): string {
  switch (id) {
    case 'preview':
      return 'Preview desk';
    case 'preprod':
      return 'Preprod desk';
    case 'undeployed':
      return 'Local desk';
    case 'mainnet':
      return 'Main desk';
    default:
      return 'Midnight desk';
  }
}

export function networkHint(id: string = NETWORK_ID): string {
  switch (id) {
    case 'preview':
      return 'Your Lace or 1AM wallet should be set to Midnight Preview.';
    case 'preprod':
      return 'Your Lace or 1AM wallet should be set to Midnight Preprod.';
    case 'undeployed':
      return 'Point your wallet at the local Midnight stack.';
    default:
      return 'Confirm your Lace or 1AM network matches this desk.';
  }
}
