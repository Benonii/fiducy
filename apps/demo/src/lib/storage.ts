import { localStorage, postgresStorage } from '@farm.js/core/storage';

export function createDemoStorageClient() {
  const databaseURL = process.env.DATABASE_URL;
  if (databaseURL) return postgresStorage({ url: databaseURL, tableName: 'fiducy_demo' });
  return localStorage({ base: `${process.env.FIDUCY_DEMO_DATA_DIR ?? '.farm'}/fiducy` });
}
