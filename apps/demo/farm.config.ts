import { defineConfig } from '@farm.js/core';
import { localStorage } from '@farm.js/core/storage';
import { fiducy } from '@fiducy/farm';

import { FIDUCY_STORAGE_MOUNT } from './src/lib/constants';
import { fiducyServer } from './src/lib/fiducy';

const dataDirectory = process.env.FIDUCY_DEMO_DATA_DIR ?? '.farm';

export default defineConfig({
  storage: {
    mounts: { [FIDUCY_STORAGE_MOUNT]: localStorage({ base: `${dataDirectory}/fiducy` }) }
  },
  integrations: {
    byok: fiducy({ instance: fiducyServer })
  }
});
