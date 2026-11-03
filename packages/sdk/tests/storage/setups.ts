import { drizzleStorage } from '../../src/storage/drizzle';
import { getMigrations, kyselyStorage } from '../../src/storage/kysely';
import { TEST_DATABASES } from './databases';
import { openDrizzle } from './drizzleDatabases';

import type { OpenedStorage, StorageSetup, TestDatabase } from './types';

async function openKyselyStorage(database: TestDatabase): Promise<OpenedStorage> {
  const options = { tableName: database.tableName };
  await (await getMigrations(database.connection, options)).runMigrations();
  return { storage: kyselyStorage(database.connection, options), cleanUp: () => undefined };
}

async function openDrizzleStorage(database: TestDatabase): Promise<OpenedStorage> {
  const drizzle = await openDrizzle(database);
  for (const statement of drizzle.statements) await database.execute(statement);
  const storage = drizzleStorage(drizzle.db, { schema: drizzle.schema });
  return { storage, cleanUp: drizzle.cleanUp };
}

const DRIZZLE_SKIPPED_LABELS = ['node:sqlite', 'promise'];

const ADAPTERS = [
  { adapter: 'kysely', openStorage: openKyselyStorage, skipsLabels: [] },
  { adapter: 'drizzle', openStorage: openDrizzleStorage, skipsLabels: DRIZZLE_SKIPPED_LABELS }
];

export const DRIZZLE_DATABASES = selectDatabases(DRIZZLE_SKIPPED_LABELS);

function selectDatabases(skippedLabels: string[]) {
  return TEST_DATABASES.filter(
    (database) => !skippedLabels.some((label) => database.label.includes(label))
  );
}

export const STORAGE_SETUPS: StorageSetup[] = ADAPTERS.flatMap((adapter) =>
  selectDatabases(adapter.skipsLabels).map((database) => ({
    label: `${adapter.adapter} on ${database.label}`,
    isAvailable: database.isAvailable,
    openDatabase: database.open,
    openStorage: adapter.openStorage
  }))
);
