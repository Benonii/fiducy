import { createEndpoint } from '@farm.js/core/api';

import { seedApp } from '@/lib/appService';
import { requireGateway } from '@/lib/middleware';
import { respondWith, respondWithFailure } from '@/lib/responses';
import { getControlStore } from '@/lib/storage';
import { seededAppSchema } from '@/lib/validators';

export const PUT = createEndpoint(
  { body: seededAppSchema, middleware: [requireGateway] },
  async ({ body }) => {
    const seeded = await seedApp(getControlStore(), body);
    if (!seeded.ok) return respondWithFailure(seeded.error);
    return respondWith(200, seeded.value, 'App seeded');
  }
);
