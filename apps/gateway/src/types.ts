import type { DeleteItemCommand, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import type { DeleteItemCommandOutput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import type { PutItemCommandOutput } from '@aws-sdk/client-dynamodb';
import type { DecryptCommand, EncryptCommand } from '@aws-sdk/client-kms';
import type { KeyWrapper, Result, SealedRecord } from '@fiducy/core';
import type { ProviderName, ProviderRegistry, TokenUsage } from '@fiducy/providers';

export type KeyAccessMode = 'gateway' | 'gateway_and_release';

export type RecordStorage = 'fiducy' | 'app';

export interface RegisteredApp {
  appID: string;
  name: string;
  accessMode: KeyAccessMode;
  monthlyRequestLimitPerKey: number;
  allowedOrigins: string[];
  recordStorage?: RecordStorage;
  revokedKeyIDs?: string[];
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

export type AttestationSource = (nonce: Uint8Array | null) => Promise<Uint8Array | null>;

export interface GatewayDependencies {
  keyWrapper: KeyWrapper;
  keyStore: KeyStore;
  appDirectory: AppDirectory;
  usageLedger: UsageLedger;
  providerRegistry: ProviderRegistry;
  attest?: AttestationSource;
  keyEvents?: KeyEventReporter;
  rateLimiter?: RateLimiter;
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

export interface KmsOutput {
  CiphertextBlob?: Uint8Array;
  Plaintext?: Uint8Array;
}

export interface KmsSender {
  send: (command: EncryptCommand | DecryptCommand) => Promise<KmsOutput>;
}

export interface KmsKeyWrapperOptions {
  client: KmsSender;
  keyID: string;
}

export interface DynamoSender {
  send(command: GetItemCommand): Promise<GetItemCommandOutput>;
  send(command: PutItemCommand): Promise<PutItemCommandOutput>;
  send(command: DeleteItemCommand): Promise<DeleteItemCommandOutput>;
}

export interface DynamoKeyStoreOptions {
  client: DynamoSender;
  tableName: string;
}

export interface InstanceRoleCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

export interface KeyEvent {
  type: 'saved' | 'revoked';
  appID: string;
  keyID: string;
}

export interface KeyEventReporter {
  report: (event: KeyEvent) => Promise<void>;
}

export interface RateLimitDecision {
  isAllowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consumeToken: (clientID: string) => RateLimitDecision;
}

export interface TokenBucketOptions {
  capacity: number;
  refillPerSecond: number;
  maximumTrackedClients: number;
  readCurrentTime?: () => number;
}

export interface TokenBucket {
  tokens: number;
  refilledAt: number;
}
