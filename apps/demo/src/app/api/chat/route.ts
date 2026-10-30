import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';

import { describeChatError } from '../../../lib/chatErrors';
import { readServerDemoConfig } from '../../../lib/config';
import { fiducyServer, readDemoUser } from '../../../lib/fiducy';
import { respondWith } from '../../../lib/responses';
import { chatRequestSchema } from '../../../lib/validators';

import type { ChatRequestBody } from '@/lib/types';

export async function POST(request: Request) {
  const config = readServerDemoConfig();
  if (!config) return respondWith(503, null, 'Set FIDUCY_APP_ID and FIDUCY_APP_SECRET');
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return respondWith(400, null, parsed.error.issues[0]?.message ?? 'Invalid chat request');
  }
  const { messages } = parsed.data as ChatRequestBody;

  const userID = readDemoUser(request);
  const settings = userID ? await fiducyServer.providerSettings('openai', { userID }) : null;
  if (!settings) return respondWith(400, null, 'Connect your API key first');

  const result = streamText({
    model: createOpenAI(settings).chat(config.model),
    messages: await convertToModelMessages(messages),
    maxRetries: 0
  });
  return result.toUIMessageStreamResponse({ onError: describeChatError });
}
