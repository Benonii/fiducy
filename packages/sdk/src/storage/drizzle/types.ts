import type { Column, SQL } from 'drizzle-orm';

export type DrizzleProvider = 'pg' | 'mysql' | 'sqlite';

export interface DrizzleStorageOptions {
  provider?: DrizzleProvider;
  table?: object;
  schema?: Record<string, unknown>;
  tableName?: string;
}

export interface DrizzleUserKeyRow {
  userID: string;
  keyID: string;
  provider: string;
  handle: string;
  record: string | null;
  createdAt: string;
}

export type DrizzleUserKeyTable = Record<keyof DrizzleUserKeyRow, Column>;

export interface DrizzleSelectQuery extends PromiseLike<DrizzleUserKeyRow[]> {
  where: (condition: SQL | undefined) => DrizzleSelectQuery;
  orderBy: (...columns: SQL[]) => DrizzleSelectQuery;
  limit: (count: number) => DrizzleSelectQuery;
}

export interface DrizzleUpsertConfig {
  target: Column[];
  set: Partial<DrizzleUserKeyRow>;
}

export interface DrizzleInsertQuery {
  onConflictDoUpdate: (config: DrizzleUpsertConfig) => PromiseLike<unknown>;
  onDuplicateKeyUpdate: (config: { set: Partial<DrizzleUserKeyRow> }) => PromiseLike<unknown>;
}

export interface DrizzleDatabase {
  select: () => { from: (table: DrizzleUserKeyTable) => DrizzleSelectQuery };
  insert: (table: DrizzleUserKeyTable) => {
    values: (row: DrizzleUserKeyRow) => DrizzleInsertQuery;
  };
  delete: (table: DrizzleUserKeyTable) => {
    where: (condition: SQL | undefined) => PromiseLike<unknown>;
  };
  _?: { fullSchema?: Record<string, unknown> };
}

export interface DrizzleConnection {
  db: DrizzleDatabase;
  table: DrizzleUserKeyTable;
}
