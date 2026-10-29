import { sealSecret } from '@fiducy/core';

import { authenticateApp } from '../authentication';
import { RELEASE_TIME_TO_LIVE_SECONDS } from '../constants';
import { resolveApiKey } from '../resolveKey';
import { respondWith, respondWithFailure } from '../responses';
import { readJSONBody, validateStoreKeyBody } from '../validators';

import type { GatewayDependencies } from '../types';

function isFromForeignOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return origin !== null && origin !== new URL(request.url).origin;
}

export async function storeKey(request: Request, dependencies: GatewayDependencies) {
  if (isFromForeignOrigin(request))
    return respondWith(403, null, 'Keys can only be added through the key widget');
  const body = validateStoreKeyBody(await readJSONBody(request));
  if (!body.ok) return respondWithFailure(body.error);
  const app = await dependencies.appDirectory.findApp(body.value.appID);
  if (!app) return respondWith(404, null, 'No app is registered with this appID');

  const { handle, record } = await sealSecret({
    ...body.value,
    keyWrapper: dependencies.keyWrapper
  });
  await dependencies.keyStore.saveRecord(record);
  return respondWith(201, { handle }, 'Key stored. Save the handle, not the key');
}

export async function revokeKey(
  request: Request,
  keyID: string,
  dependencies: GatewayDependencies
) {
  const app = await authenticateApp(dependencies.appDirectory, request.headers);
  if (!app.ok) return respondWithFailure(app.error);
  const record = await dependencies.keyStore.findRecord(keyID);
  if (record?.appID !== app.value.appID) return respondWith(404, null, 'No key found with this ID');

  await dependencies.keyStore.deleteRecord(keyID);
  return respondWith(200, { keyID }, 'Key revoked');
}

export async function releaseKey(request: Request, dependencies: GatewayDependencies) {
  const app = await authenticateApp(dependencies.appDirectory, request.headers);
  if (!app.ok) return respondWithFailure(app.error);
  if (app.value.accessMode !== 'gateway_and_release') {
    return respondWith(403, null, 'Key release is turned off for this app');
  }
  const resolved = await resolveApiKey(app.value, request.headers, dependencies);
  if (!resolved.ok) return respondWithFailure(resolved.error);
  const data = { apiKey: resolved.value.apiKey, expiresInSeconds: RELEASE_TIME_TO_LIVE_SECONDS };
  return respondWith(200, data, 'Key released. Keep it in memory only');
}
