import { parseHandle } from '@fiducy/core';

import { KEY_RECORD_HEADER, PROVIDER_BASE_PATHS } from '../constants';
import { createGatewayClient } from '../gatewayClient';

import type { SealedRecord } from '@fiducy/core';
import type { GatewayProvider } from '../types';
import type { CreateFiducyOptions, Fiducy, SaveKeyInput, StoredUserKey } from './types';
import type { UserKeySummary } from './types';

const DEFAULT_BASE_PATH = '/api/fiducy';
const RECORD_FIELDS = ['keyID', 'appID', 'ciphertext', 'iv', 'wrappedShareB'] as const;

class FiducyInputError extends Error {}

function respondWith(status: number, data: unknown, message: string): Response {
  return Response.json({ data, message }, { status });
}

function toSummary({ keyID, provider, createdAt }: StoredUserKey): UserKeySummary {
  return { keyID, provider, createdAt };
}

function isProvider(value: unknown): value is GatewayProvider {
  return typeof value === 'string' && value in PROVIDER_BASE_PATHS;
}

function isSealedRecord(value: unknown): value is SealedRecord {
  if (typeof value !== 'object' || value === null) return false;
  const fields = value as Record<string, unknown>;
  return RECORD_FIELDS.every((field) => typeof fields[field] === 'string');
}

function encodeRecord(record: SealedRecord): string {
  return Buffer.from(JSON.stringify(record)).toString('base64url');
}

// A cookie-authenticated POST or DELETE from another site would otherwise act as the user.
function isCrossSite(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin === null) return false;
  const host = request.headers.get('host') ?? new URL(request.url).host;
  return URL.parse(origin)?.host !== host;
}

function readSaveKeyInput(body: unknown): SaveKeyInput {
  if (typeof body !== 'object' || body === null) throw new FiducyInputError('Send a JSON body');
  const { provider, handle, record } = body as Record<string, unknown>;
  if (!isProvider(provider)) throw new FiducyInputError('Unknown provider');
  if (typeof handle !== 'string') throw new FiducyInputError('handle is required');
  if (record !== undefined && !isSealedRecord(record)) {
    throw new FiducyInputError('The sealed record is malformed');
  }
  return { provider, handle, record };
}

export function createFiducy(options: CreateFiducyOptions): Fiducy {
  const { storage, getUserID } = options;
  const basePath = (options.basePath ?? DEFAULT_BASE_PATH).replace(/\/+$/, '');
  const gateway = createGatewayClient(options);

  const revokeKey = async (userID: string, keyID: string) => {
    const stored = (await storage.listKeys(userID)).find((key) => key.keyID === keyID);
    if (!stored) return false;
    // In Fiducy-stored mode the record lives at the gateway, so delete it there too.
    if (!stored.record) await gateway.revokeKey(stored.handle);
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
    const stored: StoredUserKey = {
      userID,
      provider: input.provider,
      keyID,
      handle: input.handle,
      record: input.record,
      createdAt: new Date().toISOString()
    };
    await storage.saveKey(stored);
    if (previous && previous.keyID !== keyID) await revokeKey(userID, previous.keyID);
    return toSummary(stored);
  };

  const listKeys = async (userID: string) => (await storage.listKeys(userID)).map(toSummary);

  const providerSettings: Fiducy['providerSettings'] = async (provider, { userID }) => {
    const stored = await storage.findKey(userID, provider);
    if (!stored) return null;
    const settings = gateway.providerSettings(provider, stored.handle);
    if (stored.record) settings.headers[KEY_RECORD_HEADER] = encodeRecord(stored.record);
    return settings;
  };

  const route = async (request: Request, userID: string, path: string) => {
    if (path === '/keys' && request.method === 'GET') {
      return respondWith(200, { keys: await listKeys(userID) }, 'Keys loaded');
    }
    if (isCrossSite(request)) return respondWith(403, null, 'Cross-site requests are not allowed');
    if (path === '/keys' && request.method === 'POST') {
      const input = readSaveKeyInput(await request.json().catch(() => null));
      return respondWith(201, await saveKey(userID, input), 'Key connected');
    }
    const keyID = /^\/keys\/([A-Za-z0-9_-]{22})$/.exec(path)?.[1];
    if (keyID && request.method === 'DELETE') {
      const revoked = await revokeKey(userID, keyID);
      if (!revoked) return respondWith(404, null, 'No key with this ID for this user');
      return respondWith(200, { keyID }, 'Key revoked');
    }
    return respondWith(404, null, 'Route not found');
  };

  const handler = async (request: Request) => {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith(basePath)) return respondWith(404, null, 'Route not found');
    const userID = await getUserID(request);
    if (!userID) return respondWith(401, null, 'Sign in to manage your API keys');
    try {
      return await route(request, userID, pathname.slice(basePath.length));
    } catch (error) {
      if (error instanceof FiducyInputError) return respondWith(400, null, error.message);
      throw error;
    }
  };

  return { handler, providerSettings, listKeys, saveKey, revokeKey };
}
