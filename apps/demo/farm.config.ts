import { defineConfig } from '@farm.js/core';
import { localStorage, postgresStorage } from '@farm.js/core/storage';
import { fiducy } from '@fiducy/farm';
import { z } from 'zod';

import { FIDUCY_STORAGE_MOUNT } from './src/lib/constants';
import { fiducyServer } from './src/lib/fiducy';

const dataDirectory = process.env.FIDUCY_DEMO_DATA_DIR ?? '.farm';

function createDemoStorageClient() {
  const databaseURL = process.env.DATABASE_URL;
  if (databaseURL) return postgresStorage({ url: databaseURL, tableName: 'fiducy_demo' });
  return localStorage({ base: `${dataDirectory}/fiducy` });
}

export default defineConfig({
  deploy: { target: 'vercel' },
  env: {
    public: {
      FIDUCY_APP_ID: z.string().min(1),
      FIDUCY_GATEWAY_URL: z.string().url()
    },
    server: {
      FIDUCY_APP_SECRET: z.string().min(1)
    }
  },
  storage: {
    mounts: { [FIDUCY_STORAGE_MOUNT]: createDemoStorageClient() }
  },
  integrations: {
    byok: fiducy({ instance: fiducyServer })
  }
});
