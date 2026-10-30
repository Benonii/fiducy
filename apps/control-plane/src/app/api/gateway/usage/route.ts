import { createEndpoint } from '@farm.js/core/api';

import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { recordUsageBatch } from '@/lib/usageService';
import { usageBatchSchema } from '@/lib/validators';

export const POST = createEndpoint(
  { body: usageBatchSchema, middleware: [requireGateway] },
  async ({ body }) => {
    const recordedCount = await recordUsageBatch(getControlStore(), body.events);
    return respondWith(202, { recordedCount }, 'Usage recorded');
  }
);
