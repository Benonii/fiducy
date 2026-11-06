import type { SQLDialect } from '../../src/storage';
import type { KyselyStorageDatabase } from '../../src/storage/kysely';

export interface TestDatabase {
  connection: KyselyStorageDatabase;
  dialect: SQLDialect;
  tableName: string;
  execute: (statement: string) => Promise<void>;
  close: () => Promise<void>;
}
