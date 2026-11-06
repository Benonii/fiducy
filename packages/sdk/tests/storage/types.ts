import type { FiducyStorage } from '../../src/server';
import type { SQLDialect } from '../../src/storage';
import type { KyselyStorageDatabase } from '../../src/storage/kysely';

export interface TestDatabase {
  connection: KyselyStorageDatabase;
  dialect: SQLDialect;
  tableName: string;
  execute: (statement: string) => Promise<void>;
  close: () => Promise<void>;
}

export interface OpenedStorage {
  storage: FiducyStorage;
  cleanUp: () => void;
}

export interface StorageSetup {
  label: string;
  isAvailable: boolean;
  openDatabase: () => TestDatabase;
  openStorage: (database: TestDatabase) => Promise<OpenedStorage>;
}
