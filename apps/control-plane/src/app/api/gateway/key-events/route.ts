import { createEndpoint } from '@farm.js/core/api';

import { noteKeyEvent } from '@/lib/keyService';
import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { keyEventSchema } from '@/lib/validators';

export const POST = createEndpoint(
  { body: keyEventSchema, middleware: [requireGateway] },
  async ({ body }) => {
    await noteKeyEvent(getControlStore(), body);
    return respondWith(202, null, 'Key event recorded');
  }
);
