import { createEndpoint } from '@farm.js/core/api';

import { listGatewayApps } from '../../../../lib/appService';
import { requireGateway } from '../../../../lib/middleware';
import { respondWith } from '../../../../lib/responses';
import { getControlStore } from '../../../../lib/storage';

export const GET = createEndpoint({ middleware: [requireGateway] }, async () => {
  const apps = await listGatewayApps(getControlStore());
  return respondWith(200, apps, 'App configs loaded');
});
