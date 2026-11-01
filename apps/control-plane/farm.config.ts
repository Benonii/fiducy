import { defineConfig } from '@farm.js/core';

import { CONTROL_STORAGE_MOUNT } from './src/lib/constants';
import { createControlStorageClient } from './src/lib/storage';

const dataDirectory = process.env.FIDUCY_CONTROL_DATA_DIR ?? '.farm';

export default defineConfig({
  auth: {
    enabled: true,
    appName: 'Fiducci',
    database: { path: `${dataDirectory}/auth.sqlite` }
  },
  storage: {
    mounts: { [CONTROL_STORAGE_MOUNT]: createControlStorageClient() }
  }
});
