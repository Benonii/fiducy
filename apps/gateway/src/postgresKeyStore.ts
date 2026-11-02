import { SQL } from 'bun';

import { POSTGRES_KEYS_TABLE } from './constants';

import type { SealedRecord } from '@fiducy/core';
import type { KeyStore, PostgresKeyStoreOptions, SealedRecordRow } from './types';

function fromRow(row: SealedRecordRow | undefined): SealedRecord | null {
  if (!row) return null;
  return {
    keyID: row.key_id,
    appID: row.app_id,
    ciphertext: row.ciphertext,
    iv: row.iv,
    wrappedShareB: row.wrapped_share_b
  };
}

function createTable(database: SQL): Promise<unknown> {
  return database.unsafe(
    `create table if not exists ${POSTGRES_KEYS_TABLE} (
      key_id text primary key,
      app_id text not null,
      ciphertext text not null,
      iv text not null,
      wrapped_share_b text not null,
      created_at timestamptz not null default now()
    )`
  );
}

export function createPostgresKeyStore({ databaseURL }: PostgresKeyStoreOptions): KeyStore {
  const database = new SQL({ url: databaseURL, prepare: false });
  let pendingTable: Promise<unknown> | null = null;
  const ready = () => {
    pendingTable ??= createTable(database).catch((error) => {
      pendingTable = null;
      throw error;
    });
    return pendingTable;
  };
  return {
    saveRecord: async (record) => {
      await ready();
      await database`insert into ${database(POSTGRES_KEYS_TABLE)}
        (key_id, app_id, ciphertext, iv, wrapped_share_b)
        values (${record.keyID}, ${record.appID}, ${record.ciphertext}, ${record.iv}, ${record.wrappedShareB})`;
    },
    findRecord: async (keyID) => {
      await ready();
      const rows: SealedRecordRow[] = await database`select * from ${database(POSTGRES_KEYS_TABLE)}
        where key_id = ${keyID}`;
      return fromRow(rows[0]);
    },
    deleteRecord: async (keyID) => {
      await ready();
      const rows = await database`delete from ${database(POSTGRES_KEYS_TABLE)}
        where key_id = ${keyID} returning key_id`;
      return rows.length > 0;
    }
  };
}
