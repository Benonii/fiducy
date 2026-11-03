import { createEndpoint } from '@farm.js/core/api';
import { z } from 'zod';

const joinSchema = z.object({
  email: z.string().email().max(254).describe('Address to notify when the managed service opens'),
  source: z.string().max(40).default('api').describe('Where the signup came from')
});

const STATUS_SCHEMA = {
  type: 'object',
  properties: { status: { type: 'string', enum: ['joined', 'already_joined'] } },
  required: ['status']
};

const ERROR_SCHEMA = {
  type: 'object',
  properties: { error: { type: 'string' } },
  required: ['error']
};

export const POST = createEndpoint(
  {
    method: 'POST',
    body: joinSchema,
    openapi: {
      security: 'public',
      responses: {
        '200': {
          body: 'json',
          description: 'Joined, or already on the list',
          schema: STATUS_SCHEMA
        },
        '400': { body: 'json', description: 'Invalid email address', schema: ERROR_SCHEMA },
        '503': { body: 'json', description: 'Waitlist not open', schema: ERROR_SCHEMA }
      }
    }
  },
  async ({ body }) => {
    const { joinWaitlist } = await import('@/lib/waitlist');
    return joinWaitlist(body);
  }
);
