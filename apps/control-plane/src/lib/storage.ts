import { getStorage, localStorage, postgresStorage } from '@farm.js/core/storage';

import { CONTROL_STORAGE_MOUNT } from './constants';
import { createControlStore } from './controlStore';

import type { ControlStore } from './types';

export function createControlStorageClient() {
  const databaseURL = process.env.DATABASE_URL;
  if (databaseURL) return postgresStorage({ url: databaseURL, tableName: 'fiducy_control' });
  return localStorage({ base: `${process.env.FIDUCY_CONTROL_DATA_DIR ?? '.farm'}/control` });
}

export function getControlStore(): ControlStore {
  return createControlStore(getStorage(CONTROL_STORAGE_MOUNT));
}
