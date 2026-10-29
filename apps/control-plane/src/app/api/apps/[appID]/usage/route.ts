import { createEndpoint } from '@farm.js/core/api';

import { requireOwner } from '../../../../../lib/middleware';
import { respondWith, respondWithFailure } from '../../../../../lib/responses';
import { getControlStore } from '../../../../../lib/storage';
import { readMonthlyUsage, toUsageMonth } from '../../../../../lib/usageService';

export const GET = createEndpoint({ middleware: [requireOwner] }, async ({ context, params }) => {
  const month = toUsageMonth(new Date());
  const store = getControlStore();
  const usage = await readMonthlyUsage(store, context.ownerID, String(params.appID), month);
  if (!usage.ok) return respondWithFailure(usage.error);
  return respondWith(200, usage.value, 'Usage loaded');
});
