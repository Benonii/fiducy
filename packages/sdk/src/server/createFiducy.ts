import { parseHandle } from '@fiducy/core';

import { DEFAULT_BASE_PATH } from '../constants.ts';
import { createGatewayClient } from '../gatewayClient.ts';
import { resolveConnection } from './environment.ts';
import { FiducyGatewayError, FiducyInputError } from './errors.ts';
import { createProviderSettingsResolver } from './providerSettings.ts';
import { createRouter } from './routes.ts';

import type { GatewayClient } from '../types.ts';
import type { CreateFiducyOptions, Fiducy, FiducyConnection } from './types.ts';
import type { SaveKeyInput, StoredUserKey, UserKeySummary } from './types.ts';

function toSummary({ keyID, provider, createdAt }: StoredUserKey): UserKeySummary {
  return { keyID, provider, createdAt };
}

function createLazyConnection(options: CreateFiducyOptions) {
  let connection: FiducyConnection | null = null;
  let gateway: GatewayClient | null = null;
  const readConnection = () => {
    connection ??= resolveConnection(options);
    return connection;
  };
  const readGateway = () => {
    gateway ??= createGatewayClient({ ...readConnection(), fetch: options.fetch });
    return gateway;
  };
  return { readConnection, readGateway };
}

export function createFiducy(options: CreateFiducyOptions): Fiducy {
  const { storage, getUserID } = options;
  const basePath = (options.basePath ?? DEFAULT_BASE_PATH).replace(/\/+$/, '');
  const { readConnection, readGateway } = createLazyConnection(options);

  const revokeKey = async (userID: string, keyID: string) => {
    const stored = (await storage.listKeys(userID)).find((key) => key.keyID === keyID);
    if (!stored) return false;
    if (!stored.record) {
      const revoked = await readGateway().revokeKey(stored.handle);
      if (!revoked.ok && revoked.error.status !== 404) {
        throw new FiducyGatewayError(`The key could not be revoked: ${revoked.error.message}`);
      }
    }
    return storage.deleteKey(userID, keyID);
  };

  const saveKey = async (userID: string, input: SaveKeyInput) => {
    const parsedHandle = parseHandle(input.handle);
    if (!parsedHandle.ok) throw new FiducyInputError('The key handle is malformed');
    const { keyID } = parsedHandle.value;
    if (input.record && input.record.keyID !== keyID) {
      throw new FiducyInputError('The record does not belong to this handle');
    }
    const previous = await storage.findKey(userID, input.provider);
    const { provider, handle, record } = input;
    const createdAt = new Date().toISOString();
    const stored: StoredUserKey = { userID, provider, keyID, handle, record, createdAt };
    await storage.saveKey(stored);
    if (previous && previous.keyID !== keyID) {
      await revokeKey(userID, previous.keyID).catch(() => false);
    }
    return toSummary(stored);
  };

  const listKeys = async (userID: string) => (await storage.listKeys(userID)).map(toSummary);
  const actions = { listKeys, saveKey, revokeKey };

  return {
    handler: createRouter({ basePath, getUserID, readConnection, actions }),
    providerSettings: createProviderSettingsResolver(storage, getUserID, readConnection),
    listKeys,
    saveKey,
    revokeKey,
    basePath,
    storage
  };
}
