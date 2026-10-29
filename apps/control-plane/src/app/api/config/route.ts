import { createEndpoint } from '@farm.js/core/api';

import { respondWith } from '../../../lib/responses';

export const GET = createEndpoint(async () => {
  const gatewayURL = process.env.FIDUCY_GATEWAY_URL ?? 'http://localhost:8787';
  return respondWith(200, { gatewayURL }, 'Config loaded');
});
