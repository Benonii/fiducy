import { sealSecret } from '@fiducy/core';

import { identifyRevokeCaller } from '../authentication';
import { respondWith, respondWithFailure } from '../responses';
import { readJSONBody, validateStoreKeyBody } from '../validators';

import type { GatewayDependencies } from '../types';

function isFromForeignOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin === null) return false;
  const gatewayHost = request.headers.get('host') ?? new URL(request.url).host;
  return URL.parse(origin)?.host !== gatewayHost;
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
  if (app.recordStorage !== 'app') await dependencies.keyStore.saveRecord(record);
  await dependencies.keyEvents?.report({ type: 'saved', appID: app.appID, keyID: record.keyID });
  if (app.recordStorage === 'app') {
    return respondWith(201, { handle, record }, 'Key sealed. Store the handle and the record');
  }
  return respondWith(201, { handle }, 'Key stored. Save the handle, not the key');
}

export async function revokeKey(
  request: Request,
  keyID: string,
  dependencies: GatewayDependencies
) {
  const caller = await identifyRevokeCaller(
    request,
    dependencies.appDirectory,
    dependencies.controlPlaneToken
  );
  if (!caller.ok) return respondWithFailure(caller.error);
  const app = await dependencies.appDirectory.findApp(caller.value.appID);
  if (!app) return respondWith(404, null, 'No app is registered with this appID');
  if (app.recordStorage === 'app') {
    return respondWith(409, null, 'This app stores its own records. Delete the record to revoke');
  }
  const record = await dependencies.keyStore.findRecord(keyID);
  if (record?.appID !== app.appID) return respondWith(404, null, 'No key found with this ID');

  await dependencies.keyStore.deleteRecord(keyID);
  if (!caller.value.isControlPlane) {
    await dependencies.keyEvents?.report({ type: 'revoked', appID: app.appID, keyID });
  }
  return respondWith(200, { keyID }, 'Key revoked');
}
