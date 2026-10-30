import { createEndpoint } from '@farm.js/core/api';

import { requireGateway } from '../../../../lib/middleware';
import { respondWith } from '../../../../lib/responses';
import { getControlStore } from '../../../../lib/storage';
import { keyRecordSchema } from '../../../../lib/validators';

export const POST = createEndpoint(
  { body: keyRecordSchema, middleware: [requireGateway] },
  async ({ body }) => {
    await getControlStore().saveKeyRecord(body);
    return respondWith(201, { keyID: body.keyID }, 'Sealed record saved');
  }
);
