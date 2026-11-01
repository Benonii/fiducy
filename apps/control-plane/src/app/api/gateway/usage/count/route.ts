import { createEndpoint } from '@farm.js/core/api';

import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { countKeyRequestsThisMonth } from '@/lib/usageService';
import { gatewayUsageCountQuerySchema } from '@/lib/validators';

export const GET = createEndpoint(
  { query: gatewayUsageCountQuerySchema, middleware: [requireGateway] },
  async ({ query }) => {
    const store = getControlStore();
    const requestCount = await countKeyRequestsThisMonth(store, query.appID, query.keyID);
    return respondWith(200, { requestCount }, 'Request count loaded');
  }
);
