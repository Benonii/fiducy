import { describe, expect, it } from 'bun:test';

import { createApp, listGatewayApps } from '../src/lib/appService';
import { noteGatewayContact, readGatewayStatus } from '../src/lib/gatewayStatusService';
import { listAppKeys, noteKeyEvent, revokeAppKey } from '../src/lib/keyService';
import { readUsageSeries, recordUsageBatch } from '../src/lib/usageService';
import { usageSeriesQuerySchema } from '../src/lib/validators';
import { CHAT_SETTINGS, OTHER_OWNER_ID, OWNER_ID } from './fixtures';
import { createTestStore, createUsageEvent } from './fixtures';

const NOW = new Date();
const EARLIER_TODAY = new Date(NOW.getTime() - 60 * 1000).toISOString();

function savedKey(appID: string, keyID: string) {
  return { type: 'saved' as const, appID, keyID };
}

describe('listing an app keys', () => {
  it('shows stored and used keys with their provider, last use and requests this month', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    await noteKeyEvent(store, savedKey(app.appID, 'key_stored'));
    await recordUsageBatch(store, [
      createUsageEvent(app.appID, 'key_used', EARLIER_TODAY),
      createUsageEvent(app.appID, 'key_used', EARLIER_TODAY)
    ]);
    const keys = await listAppKeys(store, OWNER_ID, app.appID);
    expect(keys.ok).toBe(true);
    if (!keys.ok) return;
    expect(keys.value).toHaveLength(2);
    const byID = new Map(keys.value.map((key) => [key.keyID, key]));
    expect(byID.get('key_used')).toEqual({
      keyID: 'key_used',
      provider: 'openai',
      createdAt: EARLIER_TODAY,
      lastUsedAt: EARLIER_TODAY,
      requestCount: 2,
      status: 'active'
    });
    expect(byID.get('key_stored')).toMatchObject({
      keyID: 'key_stored',
      provider: 'unknown',
      lastUsedAt: null,
      requestCount: 0
    });
  });

  it('hides another owner app', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const keys = await listAppKeys(store, OTHER_OWNER_ID, app.appID);
    expect(keys).toMatchObject({ ok: false, error: { status: 404 } });
  });
});

describe('revoking a key from the dashboard', () => {
  it('marks it revoked and tells the gateway', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    await noteKeyEvent(store, savedKey(app.appID, 'key_a'));
    expect(await revokeAppKey(store, OWNER_ID, app.appID, 'key_a')).toEqual({
      ok: true,
      value: 'key_a'
    });
    const keys = await listAppKeys(store, OWNER_ID, app.appID);
    expect(keys).toMatchObject({ ok: true, value: [{ keyID: 'key_a', status: 'revoked' }] });
    const [gatewayApp] = await listGatewayApps(store);
    expect(gatewayApp?.revokedKeyIDs).toEqual(['key_a']);
  });

  it('refuses unknown keys and other owners', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    await noteKeyEvent(store, savedKey(app.appID, 'key_a'));
    expect(await revokeAppKey(store, OWNER_ID, app.appID, 'key_missing')).toMatchObject({
      ok: false,
      error: { status: 404 }
    });
    expect(await revokeAppKey(store, OTHER_OWNER_ID, app.appID, 'key_a')).toMatchObject({
      ok: false,
      error: { status: 404 }
    });
  });
});

describe('key events from the gateway', () => {
  it('lists a saved key and marks a revoked one', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    await noteKeyEvent(store, savedKey(app.appID, 'key_a'));
    await noteKeyEvent(store, savedKey(app.appID, 'key_a'));
    await noteKeyEvent(store, { type: 'revoked', appID: app.appID, keyID: 'key_a' });
    const keys = await listAppKeys(store, OWNER_ID, app.appID);
    expect(keys).toMatchObject({ ok: true, value: [{ keyID: 'key_a', status: 'revoked' }] });
  });
});

describe('the daily usage series', () => {
  it('fills every day and splits totals by provider', async () => {
    const store = createTestStore();
    const { app } = await createApp(store, OWNER_ID, CHAT_SETTINGS);
    const today = new Date('2026-10-30T12:00:00.000Z');
    await recordUsageBatch(store, [
      createUsageEvent(app.appID, 'key_a', '2026-10-30T08:00:00.000Z'),
      createUsageEvent(app.appID, 'key_a', '2026-10-28T08:00:00.000Z'),
      { ...createUsageEvent(app.appID, 'key_b', '2026-10-30T09:00:00.000Z'), provider: 'anthropic' }
    ]);
    const series = await readUsageSeries(store, OWNER_ID, app.appID, 3, today);
    expect(series).toEqual({
      ok: true,
      value: {
        days: [
          { date: '2026-10-28', requestCount: 1, inputTokens: 10, outputTokens: 25 },
          { date: '2026-10-29', requestCount: 0, inputTokens: 0, outputTokens: 0 },
          { date: '2026-10-30', requestCount: 2, inputTokens: 20, outputTokens: 50 }
        ],
        byProvider: [
          { provider: 'openai', requestCount: 2, inputTokens: 20, outputTokens: 50 },
          { provider: 'anthropic', requestCount: 1, inputTokens: 10, outputTokens: 25 }
        ]
      }
    });
  });

  it('accepts 1 to 90 days and defaults to 30', () => {
    expect(usageSeriesQuerySchema.parse({})).toEqual({ days: 30 });
    expect(usageSeriesQuerySchema.parse({ days: '7' })).toEqual({ days: 7 });
    expect(usageSeriesQuerySchema.safeParse({ days: '91' }).success).toBe(false);
    expect(usageSeriesQuerySchema.safeParse({ days: '0' }).success).toBe(false);
  });
});

describe('the gateway status', () => {
  it('is reachable for two minutes after the gateway last called in', async () => {
    const store = createTestStore();
    expect(await readGatewayStatus(store, NOW)).toMatchObject({
      reachable: false,
      lastSeenAt: null,
      pcr0: null
    });
    await noteGatewayContact(store, NOW);
    expect(await readGatewayStatus(store, NOW)).toMatchObject({
      reachable: true,
      lastSeenAt: NOW.toISOString()
    });
    const later = new Date(NOW.getTime() + 3 * 60 * 1000);
    expect(await readGatewayStatus(store, later)).toMatchObject({ reachable: false });
  });
});
