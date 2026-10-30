import { createEndpoint } from '@farm.js/core/api';

import { noteRevokedKey } from '@/lib/keyService';
import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';

export const GET = createEndpoint({ middleware: [requireGateway] }, async ({ params }) => {
  const record = await getControlStore().findKeyRecord(String(params.keyID));
  if (!record) return respondWith(404, null, 'No sealed record with this key ID');
  return respondWith(200, record, 'Sealed record loaded');
});

export const DELETE = createEndpoint({ middleware: [requireGateway] }, async ({ params }) => {
  const keyID = String(params.keyID);
  const store = getControlStore();
  const record = await store.findKeyRecord(keyID);
  if (!record) return respondWith(404, null, 'No sealed record with this key ID');
  await store.deleteKeyRecord(keyID);
  await noteRevokedKey(store, record.appID, keyID);
  return respondWith(200, { keyID }, 'Sealed record deleted');
});
