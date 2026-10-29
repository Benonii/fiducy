import { z } from 'zod';

export const chatRequestSchema = z.object({
  handle: z.string().trim().min(1, 'Connect your API key first'),
  messages: z.array(z.unknown()).min(1, 'Send at least one message')
});
