import { Database } from 'bun:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Kysely, PostgresDialect, SqliteDialect } from 'kysely';
import { Pool } from 'pg';

import { generateSchema } from '../../src/storage';
import { getMigrations, kyselyStorage } from '../../src/storage/kysely';
import { REQUIRES_REAL_DATABASES, TEST_DATABASES } from './databases';

import type { SealedRecord } from '@fiducy/core';
import type { FiducyStorage, StoredUserKey } from '../../src/server';
import type { KyselyStorageDatabase } from '../../src/storage/kysely';
import type { TestDatabase } from './types';

const SAMPLE_RECORD: SealedRecord = {
  keyID: 'Kq2Wm7Xr1Tn8Lb5Vc3Hj6P',
  appID: 'app_chatforge',
  ciphertext: 'f3a9Kq2Wm7Xr1Tn8Lb5Vc3Hj6Ps0Ue4Yi9Oa2Rd7Fg1',
  iv: 'Xr1Tn8Lb5Vc3Hj6P',
  wrappedShareB: 'Lb5Vc3Hj6Ps0Ue4Yi9Oa2Rd7Fg1f3a9Kq2Wm7Xr1Tn8'
};

function createStoredKey(overrides: Partial<StoredUserKey> = {}): StoredUserKey {
  const keyID = overrides.keyID ?? crypto.randomUUID().replaceAll('-', '').slice(0, 22);
  return {
    userID: 'user_ada',
    provider: 'openai',
    keyID,
    handle: `kh_${keyID}.f3a9Kq2Wm7Xr1Tn8Lb5Vc3Hj6Ps0Ue4Yi9Oa2Rd7Fg1`,
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

describe('real database coverage', () => {
  it('runs against Postgres and MySQL in CI', () => {
    if (!REQUIRES_REAL_DATABASES) return;
    expect(TEST_DATABASES.every((database) => database.isAvailable)).toBe(true);
  });
});

for (const testDatabase of TEST_DATABASES) {
  describe.skipIf(!testDatabase.isAvailable)(`kyselyStorage on ${testDatabase.label}`, () => {
    let database: TestDatabase;
    let storage: FiducyStorage;

    beforeAll(async () => {
      database = testDatabase.open();
      const { connection } = database;
      const migrations = await getMigrations(connection, { tableName: database.tableName });
      expect(migrations.toBeCreated).toEqual([database.tableName]);
      await migrations.runMigrations();
      storage = kyselyStorage(connection, { tableName: database.tableName });
    });

    afterAll(() => database.close());

    it('detects the dialect from the connection', () => {
      expect(storage.schema?.dialect).toBe(database.dialect);
      expect(storage.schema?.adapter).toBe('kysely');
    });

    it('has nothing left to migrate once the table exists', async () => {
      const migrations = await storage.schema?.getMigrations?.();
      expect(migrations?.toBeCreated).toEqual([]);
      expect(await migrations?.compileMigrations()).toBe('');
      await migrations?.runMigrations();
    });

    it('saves keys and lists them newest first for that user only', async () => {
      const older = createStoredKey({ userID: 'user_list', createdAt: '2026-11-01T10:00:00.000Z' });
      const newer = createStoredKey({
        userID: 'user_list',
        provider: 'anthropic',
        createdAt: '2026-11-02T10:00:00.000Z'
      });
      await storage.saveKey(older);
      await storage.saveKey(newer);
      await storage.saveKey(createStoredKey({ userID: 'user_other' }));
      expect(await storage.listKeys('user_list')).toEqual([newer, older]);
    });

    it('finds the newest key for a provider', async () => {
      const first = createStoredKey({ userID: 'user_find', createdAt: '2026-11-01T10:00:00.000Z' });
      const second = createStoredKey({
        userID: 'user_find',
        createdAt: '2026-11-03T10:00:00.000Z'
      });
      await storage.saveKey(first);
      await storage.saveKey(second);
      expect(await storage.findKey('user_find', 'openai')).toEqual(second);
      expect(await storage.findKey('user_find', 'gemini')).toBeNull();
    });

    it('keeps the sealed record when records live in the app', async () => {
      const key = createStoredKey({ userID: 'user_record', record: SAMPLE_RECORD });
      await storage.saveKey(key);
      expect(await storage.findKey('user_record', 'openai')).toEqual(key);
    });

    it('updates a key saved twice instead of adding a second row', async () => {
      const key = createStoredKey({ userID: 'user_twice' });
      await storage.saveKey(key);
      await storage.saveKey({ ...key, createdAt: '2026-11-04T10:00:00.000Z' });
      const keys = await storage.listKeys('user_twice');
      expect(keys).toHaveLength(1);
      expect(keys[0]?.createdAt).toBe('2026-11-04T10:00:00.000Z');
    });

    it('never lets one user overwrite or delete another user key with the same ID', async () => {
      const victimKey = createStoredKey({ userID: 'user_victim' });
      await storage.saveKey(victimKey);
      await storage.saveKey({ ...victimKey, userID: 'user_attacker', handle: 'kh_forged' });
      expect(await storage.deleteKey('user_attacker', victimKey.keyID)).toBe(true);
      expect(await storage.deleteKey('user_attacker', victimKey.keyID)).toBe(false);
      expect(await storage.listKeys('user_victim')).toEqual([victimKey]);
    });

    it('deletes only the signed-in user key and reports whether it existed', async () => {
      const key = createStoredKey({ userID: 'user_delete' });
      await storage.saveKey(key);
      expect(await storage.deleteKey('user_someone_else', key.keyID)).toBe(false);
      expect(await storage.deleteKey('user_delete', key.keyID)).toBe(true);
      expect(await storage.listKeys('user_delete')).toEqual([]);
    });

    it('treats user IDs as data, not SQL', async () => {
      const userID = `user'); drop table ${database.tableName}; --`;
      const key = createStoredKey({ userID });
      await storage.saveKey(key);
      expect(await storage.listKeys(userID)).toEqual([key]);
    });

    it('refuses to adopt a table that is missing Fiducy columns', async () => {
      const tableName = `${database.tableName}_bad`;
      await database.execute(`create table ${tableName} (user_id varchar(64) not null)`);
      const { connection } = database;
      await expect(getMigrations(connection, { tableName })).rejects.toThrow(/missing key_id/);
      await database.execute(`drop table ${tableName}`);
    });

    it('says how to create the table when it is missing', async () => {
      const unmigrated = kyselyStorage(database.connection, {
        tableName: `${database.tableName}_new`
      });
      await expect(unmigrated.listKeys('user_ada')).rejects.toThrow(/does not exist yet/);
      await expect(unmigrated.saveKey(createStoredKey())).rejects.toThrow(/getMigrations/);
    });

    it('generates the same SQL it runs', async () => {
      const generated = storage.schema?.generate();
      expect(generated?.language).toBe('sql');
      expect(generated?.suggestedPath).toBe(`fiducy_migrations/create_${database.tableName}.sql`);
      expect(generated?.contents).toContain('create table if not exists');
      await database.execute(`drop table ${database.tableName}`);
      for (const statement of (generated?.contents ?? '')
        .split(';')
        .filter((part) => part.trim())) {
        await database.execute(statement);
      }
      const key = createStoredKey({ userID: 'user_generated' });
      await storage.saveKey(key);
      expect(await storage.listKeys('user_generated')).toEqual([key]);
    });
  });
}

describe('kyselyStorage inputs', () => {
  it('accepts a Kysely instance, a dialect, or a dialect with its type', () => {
    const kysely = new Kysely<unknown>({ dialect: new PostgresDialect({ pool: new Pool() }) });
    expect(kyselyStorage({ db: kysely, type: 'postgres' }).schema?.dialect).toBe('postgres');
    expect(kyselyStorage(new PostgresDialect({ pool: new Pool() })).schema?.dialect).toBe(
      'postgres'
    );
    const dialect = new SqliteDialect({ database: async () => new Database(':memory:') as never });
    expect(kyselyStorage({ dialect, type: 'sqlite' }).schema?.dialect).toBe('sqlite');
  });

  it('rejects connections it cannot recognise', () => {
    expect(() => kyselyStorage({} as KyselyStorageDatabase)).toThrow(
      /could not tell which database/
    );
    const kysely = new Kysely<unknown>({ dialect: new PostgresDialect({ pool: new Pool() }) });
    const input = { db: kysely, type: 'mssql' } as unknown as KyselyStorageDatabase;
    expect(() => kyselyStorage(input)).toThrow(/supports type/);
  });

  it('rejects table names that are not plain identifiers', () => {
    const sqlite = new Database(':memory:');
    expect(() => kyselyStorage(sqlite, { tableName: 'keys; drop table user' })).toThrow(
      /letters, digits/
    );
    expect(() =>
      generateSchema({ adapter: 'kysely', dialect: 'postgres', tableName: 'a"b' })
    ).toThrow(/letters, digits/);
  });
});
