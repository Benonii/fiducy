import { createLocalKeyWrapper } from '@fiducy/core';
import { createProviderRegistry } from '@fiducy/providers';

import { createMemoryAppDirectory, createMemoryKeyStore } from './memoryStores';
import { createMemoryUsageLedger } from './memoryStores';
import { createRemoteAppDirectory } from './remoteAppDirectory';
import { createRemoteUsageLedger } from './remoteUsageLedger';
import { createGateway } from './router';

import type { AppRegistration, ControlPlaneConnection } from './types';

function readMasterKey(): Uint8Array {
  const encodedMasterKey = process.env.FIDUCY_MASTER_KEY;
  if (!encodedMasterKey) throw new Error('Set FIDUCY_MASTER_KEY to 32 random bytes in base64url');
  return new Uint8Array(Buffer.from(encodedMasterKey, 'base64url'));
}

function readAppRegistrations(): AppRegistration[] {
  return JSON.parse(process.env.FIDUCY_APPS_JSON ?? '[]');
}

function readControlPlaneConnection(): ControlPlaneConnection | null {
  const controlPlaneURL = process.env.FIDUCY_CONTROL_PLANE_URL;
  if (!controlPlaneURL) return null;
  const gatewayToken = process.env.FIDUCY_GATEWAY_TOKEN;
  if (!gatewayToken) throw new Error('Set FIDUCY_GATEWAY_TOKEN to match the control plane');
  return { controlPlaneURL, gatewayToken };
}

const connection = readControlPlaneConnection();

const gateway = createGateway({
  keyWrapper: createLocalKeyWrapper(readMasterKey()),
  keyStore: createMemoryKeyStore(),
  appDirectory: connection
    ? createRemoteAppDirectory({ ...connection, refreshIntervalMilliseconds: 30000 })
    : await createMemoryAppDirectory(readAppRegistrations()),
  usageLedger: connection
    ? createRemoteUsageLedger({ ...connection, flushIntervalMilliseconds: 5000 })
    : createMemoryUsageLedger(),
  providerRegistry: createProviderRegistry()
});

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),
  idleTimeout: 255,
  fetch: gateway
});
console.log(`Gateway listening on ${server.url}`);
