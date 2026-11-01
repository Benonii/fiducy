import { createEndpoint } from '@farm.js/core/api';

import { noteGatewayAttestation } from '@/lib/gatewayStatusService';
import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { gatewayAttestationSchema } from '@/lib/validators';

export const POST = createEndpoint(
  { body: gatewayAttestationSchema, middleware: [requireGateway] },
  async ({ body }) => {
    await noteGatewayAttestation(getControlStore(), body);
    return respondWith(202, null, 'Gateway status recorded');
  }
);
