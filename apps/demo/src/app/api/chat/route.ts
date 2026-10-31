import { createOpenAI } from '@ai-sdk/openai';
import { createProviderSettings } from '@fiducy/sdk';
import { convertToModelMessages, streamText } from 'ai';

import { describeChatError } from '@/lib/chatErrors';
import { readServerDemoConfig } from '@/lib/config';
import { respondWith } from '@/lib/responses';
import { chatRequestSchema } from '@/lib/validators';

import type { ChatRequestBody } from '@/lib/types';

export async function POST(request: Request) {
  const config = readServerDemoConfig();
  if (!config) return respondWith(503, null, 'Set FIDUCY_APP_ID and FIDUCY_APP_SECRET');
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return respondWith(400, null, parsed.error.issues[0]?.message ?? 'Invalid chat request');
  }
  const { handle, messages } = parsed.data as ChatRequestBody;

  const openai = createOpenAI(
    createProviderSettings(config.gatewayURL, config.appSecret, 'openai', handle)
  );
  const result = streamText({
    model: openai.chat(config.model),
    messages: await convertToModelMessages(messages),
    maxRetries: 0
  });
  return result.toUIMessageStreamResponse({ onError: describeChatError });
}
