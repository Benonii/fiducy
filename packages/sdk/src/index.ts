export { KEY_HANDLE_HEADER, PROVIDER_BASE_PATHS } from './constants';
export { createGatewayClient, createProviderSettings } from './gatewayClient';

export type {
  FetchGateway,
  GatewayClient,
  GatewayClientOptions,
  GatewayError,
  GatewayProvider,
  GatewayResult,
  ProviderSettings,
  RevokedKey
} from './types';
