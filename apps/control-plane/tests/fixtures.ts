import { createControlStore, createMemoryKeyValueStore } from '../src/lib/controlStore';

import type { AppSettings, UsageEvent } from '../src/lib/types';

export const OWNER_ID = 'user_ben';
export const OTHER_OWNER_ID = 'user_mallory';

export const CHAT_SETTINGS: AppSettings = {
  name: 'Chatforge',
  accessMode: 'gateway',
  monthlyRequestLimitPerKey: 100,
  allowedOrigins: ['https://chatforge.example']
};

export function createTestStore() {
  return createControlStore(createMemoryKeyValueStore());
}

export function createUsageEvent(appID: string, keyID: string, recordedAt: string): UsageEvent {
  return { appID, keyID, provider: 'openai', inputTokens: 10, outputTokens: 25, recordedAt };
}
