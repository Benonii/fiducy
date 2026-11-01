import { createLocalKeyWrapper } from '@fiducy/core';
import { createProviderRegistry } from '@fiducy/providers';

import { createEnclaverAttestation } from './attestation';
import { GATEWAY_TOKEN_PURPOSE, KEY_UPLOAD_BUCKET_CAPACITY } from './constants';
import { KEY_UPLOAD_MAXIMUM_TRACKED_CLIENTS, KEY_UPLOAD_REFILL_PER_SECOND } from './constants';
import { createDynamoClient, createDynamoKeyStore } from './dynamoKeyStore';
import { createKmsClient, createKmsKeyWrapper, decryptBootSecret } from './kmsKeyWrapper';
import { createMemoryAppDirectory, createMemoryKeyStore } from './memoryStores';
import { createMemoryUsageLedger } from './memoryStores';
import { createRemoteAppDirectory } from './remoteAppDirectory';
import { createRemoteKeyEvents } from './remoteKeyEvents';
import { createRemoteUsageLedger } from './remoteUsageLedger';
import { createGateway } from './router';
import { createTokenBucketRateLimiter } from './tokenBucketRateLimiter';

import type { Bytes, KeyWrapper } from '@fiducy/core';
import type { AppRegistration, ControlPlaneConnection, KeyStore, KmsSender } from './types';

interface KmsSettings {
  client: KmsSender;
  keyID: string;
}

function readMasterKey(): Bytes {
  const encodedMasterKey = process.env.FIDUCY_MASTER_KEY;
  if (!encodedMasterKey) throw new Error('Set FIDUCY_MASTER_KEY to 32 random bytes in base64url');
  return new Uint8Array(Buffer.from(encodedMasterKey, 'base64url'));
}

function readKmsSettings(): KmsSettings | null {
  const keyID = process.env.FIDUCY_KMS_KEY_ID;
  if (!keyID) return null;
  const endpoint = process.env.AWS_KMS_ENDPOINT ?? 'http://127.0.0.1:9999';
  const region = process.env.AWS_REGION ?? 'us-east-1';
  return { client: createKmsClient(endpoint, region), keyID };
}

function readAppRegistrations(): AppRegistration[] {
  return JSON.parse(process.env.FIDUCY_APPS_JSON ?? '[]');
}

async function readGatewayToken(kms: KmsSettings | null): Promise<string | undefined> {
  const ciphertext = process.env.FIDUCY_GATEWAY_TOKEN_CIPHERTEXT;
  if (!ciphertext) return process.env.FIDUCY_GATEWAY_TOKEN;
  if (!kms) throw new Error('FIDUCY_GATEWAY_TOKEN_CIPHERTEXT needs FIDUCY_KMS_KEY_ID');
  return decryptBootSecret(kms.client, kms.keyID, ciphertext, GATEWAY_TOKEN_PURPOSE);
}

async function readControlPlaneConnection(
  kms: KmsSettings | null
): Promise<ControlPlaneConnection | null> {
  const controlPlaneURL = process.env.FIDUCY_CONTROL_PLANE_URL;
  if (!controlPlaneURL) return null;
  const gatewayToken = await readGatewayToken(kms);
  if (!gatewayToken) throw new Error('Set FIDUCY_GATEWAY_TOKEN to match the control plane');
  return { controlPlaneURL, gatewayToken };
}

function selectKeyStore(): KeyStore {
  const tableName = process.env.FIDUCY_KEYS_TABLE;
  if (!tableName) return createMemoryKeyStore();
  const client = createDynamoClient(process.env.AWS_REGION ?? 'us-east-1');
  return createDynamoKeyStore({ client, tableName });
}

function selectKeyWrapper(kms: KmsSettings | null): KeyWrapper {
  return kms ? createKmsKeyWrapper(kms) : createLocalKeyWrapper(readMasterKey());
}

const kms = readKmsSettings();
const connection = await readControlPlaneConnection(kms);
const enclaveAPIURL = process.env.FIDUCY_ENCLAVE_API_URL;

const gateway = createGateway({
  keyWrapper: selectKeyWrapper(kms),
  keyStore: selectKeyStore(),
  keyEvents: connection ? createRemoteKeyEvents(connection) : undefined,
  appDirectory: connection
    ? createRemoteAppDirectory({ ...connection, refreshIntervalMilliseconds: 30000 })
    : await createMemoryAppDirectory(readAppRegistrations()),
  usageLedger: connection
    ? createRemoteUsageLedger({ ...connection, flushIntervalMilliseconds: 5000 })
    : createMemoryUsageLedger(),
  providerRegistry: createProviderRegistry(),
  attest: enclaveAPIURL ? createEnclaverAttestation(enclaveAPIURL) : undefined,
  rateLimiter: createTokenBucketRateLimiter({
    capacity: KEY_UPLOAD_BUCKET_CAPACITY,
    refillPerSecond: KEY_UPLOAD_REFILL_PER_SECOND,
    maximumTrackedClients: KEY_UPLOAD_MAXIMUM_TRACKED_CLIENTS
  })
});

const server = Bun.serve({
  port: Number(process.env.PORT ?? 8787),
  idleTimeout: 255,
  fetch: gateway
});
console.log(
  `Gateway listening on ${server.url} (keys wrapped by ${kms ? 'KMS' : 'a local master key'})`
);
