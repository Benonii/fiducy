import { describe, expect, it } from 'bun:test';

import { createApp } from '../src/lib/appService';
import { readMonthlyUsage, recordUsageBatch } from '../src/lib/usageService';
import { appSettingsSchema, usageBatchSchema } from '../src/lib/validators';
import { CHAT_SETTINGS, OTHER_OWNER_ID, OWNER_ID } from './fixtures';
import { createTestStore, createUsageEvent } from './fixtures';

import type { StoredKeyEntry } from '../src/lib/types';

describe('recording usage from the gateway', () => {
  it('adds requests and tokens per app, month and key', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const recorded = await recordUsageBatch(store, [
      createUsageEvent(app.appID, 'key_a', '2026-10-02T08:00:00.000Z'),
      createUsageEvent(app.appID, 'key_a', '2026-10-03T08:00:00.000Z'),
      createUsageEvent(app.appID, 'key_b', '2026-10-04T08:00:00.000Z'),
      createUsageEvent(app.appID, 'key_a', '2026-09-30T23:59:59.000Z')
    ]);
    expect(recorded).toBe(4);
    const october = await readMonthlyUsage(store, OWNER_ID, app.appID, '2026-10');
    expect(october).toEqual({
      ok: true,
      value: {
        month: '2026-10',
        requestCount: 3,
        inputTokens: 30,
        outputTokens: 75,
        requestsByKey: { key_a: 2, key_b: 1 }
      }
    });
    const september = await readMonthlyUsage(store, OWNER_ID, app.appID, '2026-09');
    expect(september).toMatchObject({ ok: true, value: { requestCount: 1 } });
  });

  it('adds to earlier batches instead of replacing them', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const event = createUsageEvent(app.appID, 'key_a', '2026-10-02T08:00:00.000Z');
    await recordUsageBatch(store, [event]);
    await recordUsageBatch(store, [event]);
    const usage = await readMonthlyUsage(store, OWNER_ID, app.appID, '2026-10');
    expect(usage).toMatchObject({ ok: true, value: { requestCount: 2, inputTokens: 20 } });
  });

  it('reads and writes each key entry once per batch with its latest use', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const keyEntryCalls = { reads: 0, writes: 0 };
    const countingStore = {
      ...store,
      findKeyEntry: (appID: string, keyID: string) => {
        keyEntryCalls.reads += 1;
        return store.findKeyEntry(appID, keyID);
      },
      saveKeyEntry: (entry: StoredKeyEntry) => {
        keyEntryCalls.writes += 1;
        return store.saveKeyEntry(entry);
      }
    };
    await recordUsageBatch(countingStore, [
      createUsageEvent(app.appID, 'key_a', '2026-10-03T08:00:00.000Z'),
      {
        ...createUsageEvent(app.appID, 'key_a', '2026-10-05T08:00:00.000Z'),
        provider: 'anthropic'
      },
      createUsageEvent(app.appID, 'key_a', '2026-09-30T23:59:59.000Z'),
      createUsageEvent(app.appID, 'key_b', '2026-10-04T08:00:00.000Z')
    ]);
    expect(keyEntryCalls).toEqual({ reads: 2, writes: 2 });
    expect(await store.findKeyEntry(app.appID, 'key_a')).toMatchObject({
      provider: 'anthropic',
      createdAt: '2026-09-30T23:59:59.000Z',
      lastUsedAt: '2026-10-05T08:00:00.000Z'
    });
  });

  it('keeps the later use time when an older batch arrives', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    await recordUsageBatch(store, [
      createUsageEvent(app.appID, 'key_a', '2026-10-05T08:00:00.000Z')
    ]);
    await recordUsageBatch(store, [
      createUsageEvent(app.appID, 'key_a', '2026-10-02T08:00:00.000Z')
    ]);
    expect(await store.findKeyEntry(app.appID, 'key_a')).toMatchObject({
      lastUsedAt: '2026-10-05T08:00:00.000Z'
    });
  });

  it('skips events for apps that no longer exist', async () => {
    const store = createTestStore();
    const event = createUsageEvent('app_deleted', 'key_a', '2026-10-02T08:00:00.000Z');
    expect(await recordUsageBatch(store, [event])).toBe(0);
  });

  it('only shows usage to the app owner', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const usage = await readMonthlyUsage(store, OTHER_OWNER_ID, app.appID, '2026-10');
    expect(usage).toMatchObject({ ok: false, error: { status: 404 } });
  });
});

describe('validating input', () => {
  it('accepts bare origins and rejects paths, other schemes and empty names', () => {
    const valid = appSettingsSchema.safeParse({
      ...CHAT_SETTINGS,
      allowedOrigins: ['http://localhost:5173']
    });
    expect(valid.success).toBe(true);
    for (const origin of [
      'https://chatforge.example/app',
      'javascript:alert(1)',
      'chatforge.example'
    ]) {
      expect(
        appSettingsSchema.safeParse({ ...CHAT_SETTINGS, allowedOrigins: [origin] }).success
      ).toBe(false);
    }
    expect(appSettingsSchema.safeParse({ ...CHAT_SETTINGS, name: '  ' }).success).toBe(false);
  });

  it('rejects negative token counts and oversized batches', () => {
    const event = createUsageEvent('app_x', 'key_a', '2026-10-02T08:00:00.000Z');
    expect(usageBatchSchema.safeParse({ events: [{ ...event, inputTokens: -1 }] }).success).toBe(
      false
    );
    const tooMany = Array.from({ length: 1001 }, () => event);
    expect(usageBatchSchema.safeParse({ events: tooMany }).success).toBe(false);
  });
});
