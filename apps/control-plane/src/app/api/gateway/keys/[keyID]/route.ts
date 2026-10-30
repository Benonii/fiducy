import { createEndpoint } from '@farm.js/core/api';

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
  const deleted = await getControlStore().deleteKeyRecord(keyID);
  if (!deleted) return respondWith(404, null, 'No sealed record with this key ID');
  return respondWith(200, { keyID }, 'Sealed record deleted');
});
