import { defineConfig } from '@farm.js/core';
import { localStorage } from '@farm.js/core/storage';
import { fiducy } from '@fiducy/farm';
import { z } from 'zod';

import { FIDUCY_STORAGE_MOUNT } from './src/lib/constants';
import { fiducyServer } from './src/lib/fiducy';

const dataDirectory = process.env.FIDUCY_DEMO_DATA_DIR ?? '.farm';

export default defineConfig({
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
    mounts: { [FIDUCY_STORAGE_MOUNT]: localStorage({ base: `${dataDirectory}/fiducy` }) }
  },
  integrations: {
    byok: fiducy({ instance: fiducyServer })
  }
});
