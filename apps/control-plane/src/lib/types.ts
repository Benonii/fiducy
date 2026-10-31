export type KeyAccessMode = 'gateway' | 'gateway_and_release';

export interface AppSettings {
  name: string;
  accessMode: KeyAccessMode;
  monthlyRequestLimitPerKey: number;
  allowedOrigins: string[];
}

export interface StoredApp extends AppSettings {
  appID: string;
  ownerID: string;
  appSecretHash: string;
  appSecretPreview: string;
  createdAt: string;
}

export type AppView = Omit<StoredApp, 'appSecretHash' | 'ownerID'>;

export type GatewayApp = Omit<StoredApp, 'ownerID' | 'appSecretPreview' | 'createdAt'>;

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

export interface SeededApp extends AppSettings {
  appID: string;
  appSecretHash: string;
}

export interface KeyValueStore {
  getItem: (key: string) => Promise<unknown>;
  setItem: (key: string, value: StoredApp | UsageSummary | true) => Promise<void>;
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
}

export interface ControlFailure {
  status: number;
  message: string;
}

export type Result<Value, Failure> = { ok: true; value: Value } | { ok: false; error: Failure };

export type ControlResult<Value> = Result<Value, ControlFailure>;
