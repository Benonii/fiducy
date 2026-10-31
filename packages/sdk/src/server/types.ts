import type { SealedRecord } from '@fiducy/core';
import type { FetchGateway, GatewayProvider, ProviderSettings } from '../types';

export interface StoredUserKey {
  userID: string;
  provider: GatewayProvider;
  keyID: string;
  handle: string;
  record?: SealedRecord;
  createdAt: string;
}

export interface UserKeySummary {
  keyID: string;
  provider: GatewayProvider;
  createdAt: string;
}

export interface FiducyStorage {
  saveKey: (key: StoredUserKey) => Promise<void>;
  findKey: (userID: string, provider: GatewayProvider) => Promise<StoredUserKey | null>;
  listKeys: (userID: string) => Promise<StoredUserKey[]>;
  deleteKey: (userID: string, keyID: string) => Promise<boolean>;
}

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
  getUserID: (request: Request) => Promise<string | null> | string | null;
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
