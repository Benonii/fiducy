import { createEndpoint } from '@farm.js/core/api';

import { requireOwner } from '@/lib/middleware';
import { respondWith, respondWithFailure } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { readUsageSeries } from '@/lib/usageService';
import { usageSeriesQuerySchema } from '@/lib/validators';

export const GET = createEndpoint(
  { query: usageSeriesQuerySchema, middleware: [requireOwner] },
  async ({ context, params, query }) => {
    const store = getControlStore();
    const series = await readUsageSeries(store, context.ownerID, String(params.appID), query.days);
    if (!series.ok) return respondWithFailure(series.error);
    return respondWith(200, series.value, 'Usage series loaded');
  }
);
