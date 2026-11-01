import { createEndpoint } from '@farm.js/core/api';

import { readGatewayStatus } from '@/lib/gatewayStatusService';
import { requireOwner } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';

export const GET = createEndpoint({ middleware: [requireOwner] }, async () => {
  const status = await readGatewayStatus(getControlStore());
  return respondWith(200, status, 'Gateway status loaded');
});
