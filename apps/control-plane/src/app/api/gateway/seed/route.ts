import { createEndpoint } from '@farm.js/core/api';

import { seedApp } from '@/lib/appService';
import { requireGateway } from '@/lib/middleware';
import { respondWith } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { seededAppSchema } from '@/lib/validators';

export const PUT = createEndpoint(
  { body: seededAppSchema, middleware: [requireGateway] },
  async ({ body }) => {
    const app = await seedApp(getControlStore(), body);
    return respondWith(200, app, 'App seeded');
  }
);
