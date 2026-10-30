import type { SealedRecord } from '@fiducy/core';
import type { FetchGateway, GatewayProvider, ProviderSettings } from '../types';

export interface StoredUserKey {
  userID: string;
  provider: GatewayProvider;
  keyID: string;
  handle: string;
  /** Present only when the app stores its own sealed records. */
  record?: SealedRecord;
  createdAt: string;
}

export interface UserKeySummary {
  keyID: string;
  provider: GatewayProvider;
  createdAt: string;
}

/** Where the app keeps handles (and records, in app-owned mode). Like a Better Auth adapter. */
export interface FiducyStorage {
  saveKey: (key: StoredUserKey) => Promise<void>;
  findKey: (userID: string, provider: GatewayProvider) => Promise<StoredUserKey | null>;
  listKeys: (userID: string) => Promise<StoredUserKey[]>;
  deleteKey: (userID: string, keyID: string) => Promise<boolean>;
}

/** The shape of unstorage and Farm.js storage mounts, so either can back Fiducy. */
export interface KeyValueDriver {
  getItem: (key: string) => Promise<unknown>;
  setItem: (key: string, value: StoredUserKey) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  getKeys: (base?: string) => Promise<string[]>;
}

export interface CreateFiducyOptions {
  gatewayURL: string;
  appSecret: string;
  storage: FiducyStorage;
  /** Returns the signed-in user for a request, for example from your Better Auth session. */
  getUserID: (request: Request) => Promise<string | null> | string | null;
  /** Where the handler is mounted. Defaults to /api/fiducy. */
  basePath?: string;
  fetch?: FetchGateway;
}

export interface SaveKeyInput {
  provider: GatewayProvider;
  handle: string;
  record?: SealedRecord;
}

export interface Fiducy {
  handler: (request: Request) => Promise<Response>;
  providerSettings: (
    provider: GatewayProvider,
    user: { userID: string }
  ) => Promise<ProviderSettings | null>;
  listKeys: (userID: string) => Promise<UserKeySummary[]>;
  saveKey: (userID: string, input: SaveKeyInput) => Promise<UserKeySummary>;
  revokeKey: (userID: string, keyID: string) => Promise<boolean>;
}
