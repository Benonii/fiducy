export { createFiducy } from './server/createFiducy';
export { keyValueStorage, memoryStorage } from './server/storage';

export type {
  CreateFiducyOptions,
  Fiducci,
  FiducyStorage,
  KeyValueDriver,
  SaveKeyInput,
  StoredUserKey,
  UserKeySummary
} from './server/types';
export type { GatewayProvider, ProviderSettings } from './types';
