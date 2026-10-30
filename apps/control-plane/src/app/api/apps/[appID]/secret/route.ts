import { createEndpoint } from '@farm.js/core/api';

import { rotateAppSecret } from '@/lib/appService';
import { requireOwner } from '@/lib/middleware';
import { respondWith, respondWithFailure } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';

export const POST = createEndpoint({ middleware: [requireOwner] }, async ({ context, params }) => {
  const rotated = await rotateAppSecret(getControlStore(), context.ownerID, String(params.appID));
  if (!rotated.ok) return respondWithFailure(rotated.error);
  return respondWith(200, rotated.value, 'Secret rotated. The old secret stops working shortly');
});
