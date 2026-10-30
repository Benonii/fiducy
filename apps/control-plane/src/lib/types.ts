export type KeyAccessMode = 'gateway' | 'gateway_and_release';
export type RecordStorage = 'fiducy' | 'app';

export interface AppSettings {
  name: string;
  accessMode: KeyAccessMode;
  monthlyRequestLimitPerKey: number;
  allowedOrigins: string[];
  recordStorage?: RecordStorage;
}

export interface StoredApp extends AppSettings {
  appID: string;
  ownerID: string;
  appSecretHash: string;
  appSecretPreview: string;
  createdAt: string;
}

export type AppView = Omit<StoredApp, 'appSecretHash' | 'ownerID'>;

export interface GatewayApp extends Omit<StoredApp, 'ownerID' | 'appSecretPreview' | 'createdAt'> {
  revokedKeyIDs: string[];
}

export interface CreatedApp {
  app: AppView;
  appSecret: string;
}

export interface UsageEvent {
  appID: string;
  keyID: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  recordedAt: string;
}

export interface UsageSummary {
  month: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  requestsByKey: Record<string, number>;
}

export interface StoredKeyRecord {
  keyID: string;
  appID: string;
  ciphertext: string;
  iv: string;
  wrappedShareB: string;
}

export interface SeededApp extends AppSettings {
  appID: string;
  appSecretHash: string;
}

export type StoredValue =
  | StoredApp
  | UsageSummary
  | StoredKeyRecord
  | StoredKeyEntry
  | DailyUsage
  | GatewayHeartbeat
  | true;

export interface KeyValueStore {
  getItem: (key: string) => Promise<unknown>;
  setItem: (key: string, value: StoredValue) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  getKeys: (base?: string) => Promise<string[]>;
}

export interface ControlStore {
  saveApp: (app: StoredApp) => Promise<void>;
  findApp: (appID: string) => Promise<StoredApp | null>;
  deleteApp: (app: StoredApp) => Promise<void>;
  listAppsByOwner: (ownerID: string) => Promise<StoredApp[]>;
  listAllApps: () => Promise<StoredApp[]>;
  readUsage: (appID: string, month: string) => Promise<UsageSummary>;
  saveUsage: (appID: string, summary: UsageSummary) => Promise<void>;
  saveKeyRecord: (record: StoredKeyRecord) => Promise<void>;
  findKeyRecord: (keyID: string) => Promise<StoredKeyRecord | null>;
  deleteKeyRecord: (keyID: string) => Promise<boolean>;
  saveKeyEntry: (entry: StoredKeyEntry) => Promise<void>;
  findKeyEntry: (appID: string, keyID: string) => Promise<StoredKeyEntry | null>;
  listKeyEntries: (appID: string) => Promise<StoredKeyEntry[]>;
  readDailyUsage: (appID: string, date: string) => Promise<DailyUsage>;
  saveDailyUsage: (appID: string, usage: DailyUsage) => Promise<void>;
  readGatewayHeartbeat: () => Promise<GatewayHeartbeat | null>;
  saveGatewayHeartbeat: (heartbeat: GatewayHeartbeat) => Promise<void>;
}

export interface ControlFailure {
  status: number;
  message: string;
}

export type Result<Value, Failure> = { ok: true; value: Value } | { ok: false; error: Failure };

export type ControlResult<Value> = Result<Value, ControlFailure>;

export type KeyStatus = 'active' | 'revoked';

export interface AppKeyView {
  keyID: string;
  provider: string;
  createdAt: string;
  lastUsedAt: string | null;
  requestCount: number;
  status: KeyStatus;
}

export interface UsageDay {
  date: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
}

export interface ProviderUsage {
  provider: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
}

export interface UsageSeries {
  days: UsageDay[];
  byProvider: ProviderUsage[];
}

export interface GatewayStatus {
  reachable: boolean;
  lastSeenAt: string | null;
  pcr0: string | null;
  attestedAt: string | null;
  region: string | null;
}

export interface StoredKeyEntry {
  keyID: string;
  appID: string;
  provider: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: KeyStatus;
}

export interface TokenTotals {
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
}

export interface DailyUsage extends TokenTotals {
  date: string;
  byProvider: Record<string, TokenTotals>;
}

export interface GatewayHeartbeat {
  lastSeenAt: string;
}
