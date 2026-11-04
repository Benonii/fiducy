export { createFiducy } from './server/createFiducy.ts';
export { keyValueStorage, memoryStorage } from './server/storage.ts';

export type {
  CreateFiducyOptions,
  Fiducy,
  FiducyStorage,
  ImportedUserKey,
  ImportKeyInput,
  ImportKeysResult,
  KeySource,
  KeyValueDriver,
  SaveKeyInput,
  StoredUserKey,
  UserKeySummary
} from './server/types.ts';
export type { GatewayProvider, ProviderSettings } from './types.ts';
