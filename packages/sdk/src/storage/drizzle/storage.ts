import { and, desc, eq, getTableName } from 'drizzle-orm';

import { explainMissingTable } from '../errors.ts';
import { generateSchema } from '../generateSchema.ts';
import { fromUserKeyModel, toUserKeyModel } from '../rows.ts';
import { resolveTableName } from '../sqlSchema.ts';
import { assertUserKeyTable, readTableDialect, resolveDrizzleTable } from './table.ts';

import type { FiducyStorage, StoredUserKey } from '../../server/types.ts';
import type { SQLDialect } from '../types.ts';
import type { DrizzleConnection, DrizzleDatabase, DrizzleStorageOptions } from './types.ts';

function upsertKey({ db, table }: DrizzleConnection, dialect: SQLDialect, key: StoredUserKey) {
  const row = toUserKeyModel(key);
  const { provider, handle, record, createdAt } = row;
  const insert = db.insert(table).values(row);
  const set = { provider, handle, record, createdAt };
  if (dialect === 'mysql') return insert.onDuplicateKeyUpdate({ set });
  return insert.onConflictDoUpdate({ target: [table.userID, table.keyID], set });
}

function selectUserKeys({ db, table }: DrizzleConnection, userID: string, provider?: string) {
  const conditions = [eq(table.userID, userID)];
  if (provider) conditions.push(eq(table.provider, provider));
  return db
    .select()
    .from(table)
    .where(and(...conditions))
    .orderBy(desc(table.createdAt));
}

const DRIZZLE_TABLE_HINT =
  "Add the table from generateSchema({ adapter: 'drizzle' }) to your schema and run drizzle-kit migrate or drizzle-kit push";

function createUserKeyMethods(
  connection: DrizzleConnection,
  dialect: SQLDialect,
  tableName: string
): FiducyStorage {
  const { db, table } = connection;
  const rethrowMissingTable = explainMissingTable(tableName, DRIZZLE_TABLE_HINT);
  const matchKey = (userID: string, keyID: string) =>
    and(eq(table.userID, userID), eq(table.keyID, keyID));
  return {
    saveKey: async (key) => {
      await Promise.resolve(upsertKey(connection, dialect, key)).catch(rethrowMissingTable);
    },
    findKey: async (userID, provider) => {
      const query = selectUserKeys(connection, userID, provider).limit(1);
      const [row] = await Promise.resolve(query).catch(rethrowMissingTable);
      return row ? fromUserKeyModel(row) : null;
    },
    listKeys: async (userID) => {
      const rows = await Promise.resolve(selectUserKeys(connection, userID)).catch(
        rethrowMissingTable
      );
      return rows.map(fromUserKeyModel);
    },
    deleteKey: async (userID, keyID) => {
      const query = db.select().from(table).where(matchKey(userID, keyID)).limit(1);
      const existing = await Promise.resolve(query).catch(rethrowMissingTable);
      if (existing.length === 0) return false;
      await db.delete(table).where(matchKey(userID, keyID));
      return true;
    }
  };
}

export function drizzleStorage(
  database: object,
  options: DrizzleStorageOptions = {}
): FiducyStorage {
  const db = database as DrizzleDatabase;
  const drizzleTable = resolveDrizzleTable(db, options);
  const tableName = resolveTableName(getTableName(drizzleTable));
  const dialect = readTableDialect(drizzleTable, options.provider);
  const connection = { db, table: assertUserKeyTable(drizzleTable) };
  return {
    ...createUserKeyMethods(connection, dialect, tableName),
    schema: {
      adapter: 'drizzle',
      dialect,
      tableName,
      generate: () => generateSchema({ adapter: 'drizzle', dialect, tableName })
    }
  };
}
