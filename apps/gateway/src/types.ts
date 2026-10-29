import type { KeyWrapper, Result, SealedRecord } from '@fiducy/core';
import type { ProviderName, ProviderRegistry, TokenUsage } from '@fiducy/providers';

export type KeyAccessMode = 'gateway' | 'gateway_and_release';

export interface RegisteredApp {
  appID: string;
  name: string;
  accessMode: KeyAccessMode;
  monthlyRequestLimitPerKey: number;
  allowedOrigins: string[];
}

export interface AppRegistration extends RegisteredApp {
  appSecret: string;
}

export interface KeyStore {
  saveRecord: (record: SealedRecord) => Promise<void>;
  findRecord: (keyID: string) => Promise<SealedRecord | null>;
  deleteRecord: (keyID: string) => Promise<boolean>;
}

export interface AppDirectory {
  findApp: (appID: string) => Promise<RegisteredApp | null>;
  findAppBySecret: (appSecret: string) => Promise<RegisteredApp | null>;
}

export interface UsageEvent {
  appID: string;
  keyID: string;
  provider: ProviderName;
  usage: TokenUsage;
  recordedAt: Date;
}

export interface UsageLedger {
  recordUsage: (event: UsageEvent) => Promise<void>;
  countRequestsThisMonth: (keyID: string) => Promise<number>;
}

export interface GatewayDependencies {
  keyWrapper: KeyWrapper;
  keyStore: KeyStore;
  appDirectory: AppDirectory;
  usageLedger: UsageLedger;
  providerRegistry: ProviderRegistry;
}

export interface StoreKeyBody {
  appID: string;
  apiKey: string;
}

export interface GatewayFailure {
  status: number;
  message: string;
}

export interface ResolvedKey {
  apiKey: string;
  record: SealedRecord;
}

export type GatewayResult<Value> = Result<Value, GatewayFailure>;

export interface WidgetPageInput {
  appID: string;
  appName: string;
  parentOrigin: string;
  nonce: string;
}

export type RequestHandler = (request: Request) => Promise<Response>;

export interface ControlPlaneConnection {
  controlPlaneURL: string;
  gatewayToken: string;
}

export interface RemoteAppDirectoryOptions extends ControlPlaneConnection {
  refreshIntervalMilliseconds: number;
}

export interface RemoteUsageLedgerOptions extends ControlPlaneConnection {
  flushIntervalMilliseconds: number;
}

export interface RemoteAppConfig extends RegisteredApp {
  appSecretHash: string;
}

export interface FlushableUsageLedger extends UsageLedger {
  flush: () => Promise<number>;
  stop: () => Promise<void>;
}
