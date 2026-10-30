import { createEndpoint } from '@farm.js/core/api';

import { listAppKeys } from '@/lib/keyService';
import { requireOwner } from '@/lib/middleware';
import { respondWith, respondWithFailure } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';

export const GET = createEndpoint({ middleware: [requireOwner] }, async ({ context, params }) => {
  const keys = await listAppKeys(getControlStore(), context.ownerID, String(params.appID));
  if (!keys.ok) return respondWithFailure(keys.error);
  return respondWith(200, keys.value, 'Keys loaded');
});
