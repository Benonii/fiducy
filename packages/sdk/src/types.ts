import type { Result } from '@fiducy/core';
import type { PROVIDER_BASE_PATHS } from './constants';

export type GatewayProvider = keyof typeof PROVIDER_BASE_PATHS;

export type FetchGateway = (url: string, init: RequestInit) => Promise<Response>;

export interface GatewayClientOptions {
  gatewayURL: string;
  appSecret: string;
  fetch?: FetchGateway;
}

export interface ProviderSettings {
  baseURL: string;
  apiKey: string;
  headers: Record<string, string>;
}

export interface GatewayError {
  status: number;
  message: string;
}

export type GatewayResult<T> = Result<T, GatewayError>;

export interface ReleasedKey {
  apiKey: string;
  expiresInSeconds: number;
}

export interface RevokedKey {
  keyID: string;
}

export interface GatewayClient {
  providerSettings: (provider: GatewayProvider, handle: string) => ProviderSettings;
  revokeKey: (handle: string) => Promise<GatewayResult<RevokedKey>>;
  releaseKey: (handle: string) => Promise<GatewayResult<ReleasedKey>>;
}

export interface GatewayResponseBody<T> {
  data: T | null;
  message: string;
}

export interface KeyWidgetProps {
  gatewayURL: string;
  appID: string;
  onHandle: (handle: string) => void;
  onError?: (message: string) => void;
  className?: string;
}
