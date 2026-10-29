import { createLocalKeyWrapper } from '@fiducy/core';
import { createProviderRegistry } from '@fiducy/providers';

import {
  createMemoryAppDirectory,
  createMemoryKeyStore,
  createMemoryUsageLedger
} from './memoryStores';
import { createGateway } from './router';

import type { AppRegistration } from './types';

function readMasterKey(): Uint8Array {
  const encodedMasterKey = process.env.FIDUCY_MASTER_KEY;
  if (!encodedMasterKey) throw new Error('Set FIDUCY_MASTER_KEY to 32 random bytes in base64url');
  return new Uint8Array(Buffer.from(encodedMasterKey, 'base64url'));
}

function readAppRegistrations(): AppRegistration[] {
  return JSON.parse(process.env.FIDUCY_APPS_JSON ?? '[]');
}

const gateway = createGateway({
  keyWrapper: createLocalKeyWrapper(readMasterKey()),
  keyStore: createMemoryKeyStore(),
  appDirectory: await createMemoryAppDirectory(readAppRegistrations()),
  usageLedger: createMemoryUsageLedger(),
  providerRegistry: createProviderRegistry()
});

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),
  idleTimeout: 255,
  fetch: gateway
});
console.log(`Gateway listening on ${server.url}`);
