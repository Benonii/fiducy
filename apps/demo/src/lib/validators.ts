import { z } from 'zod';

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1, 'Send at least one message'),
  tools: z.record(z.unknown()).optional(),
  model: z.string().optional()
});
