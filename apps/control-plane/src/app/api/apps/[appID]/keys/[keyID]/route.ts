import { createEndpoint } from '@farm.js/core/api';

import { revokeAppKey } from '@/lib/keyService';
import { requireOwner } from '@/lib/middleware';
import { respondWith, respondWithFailure } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';

export const DELETE = createEndpoint(
  { middleware: [requireOwner] },
  async ({ context, params }) => {
    const revoked = await revokeAppKey(
      getControlStore(),
      context.ownerID,
      String(params.appID),
      String(params.keyID)
    );
    if (!revoked.ok) return respondWithFailure(revoked.error);
    return respondWith(
      200,
      { keyID: revoked.value },
      'Key revoked. The gateway stops using it within 30 seconds'
    );
  }
);
