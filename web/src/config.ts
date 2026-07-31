import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

/** Public app config — safe to commit (no secrets). Updated after preview deploy. */
export const APP_CONFIG = {
  networkId: 'preview' as const,
  contractAddress: '206dbc664982bd59189123e331d1f0ce5a7b76b238edd4e78e39feb7c15c4457',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  zkAssetPath: '/zk/blind-cartel',
} as const;

// Required before ledger decode, wallet connect, or any contract operation (preview network).
setNetworkId(APP_CONFIG.networkId as NetworkId);

export const NETWORK_ID = APP_CONFIG.networkId;
export const CONTRACT_ADDRESS = APP_CONFIG.contractAddress;
export const INDEXER_URL = APP_CONFIG.indexer;
export const ZK_ASSET_PATH = APP_CONFIG.zkAssetPath;
export const ZK_ASSET_ORIGIN =
  typeof window !== 'undefined'
    ? new URL(ZK_ASSET_PATH, window.location.origin).toString()
    : ZK_ASSET_PATH;
