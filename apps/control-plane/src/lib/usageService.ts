import { fail, succeed } from './result';

import { findOwnedApp } from './appService';
import { groupBy } from './common';
import { noteKeyUses } from './keyService';

import type { ControlResult, ControlStore, UsageEvent, UsageSummary } from './types';
import type { DailyUsage, ProviderUsage, TokenTotals, UsageDay, UsageSeries } from './types';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function toUsageMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function addEvent(summary: UsageSummary, event: UsageEvent): UsageSummary {
  return {
    ...summary,
    requestCount: summary.requestCount + 1,
    inputTokens: summary.inputTokens + event.inputTokens,
    outputTokens: summary.outputTokens + event.outputTokens,
    requestsByKey: {
      ...summary.requestsByKey,
      [event.keyID]: (summary.requestsByKey[event.keyID] ?? 0) + 1
    }
  };
}

export function toUsageDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addTotals(totals: TokenTotals | undefined, event: UsageEvent): TokenTotals {
  return {
    requestCount: (totals?.requestCount ?? 0) + 1,
    inputTokens: (totals?.inputTokens ?? 0) + event.inputTokens,
    outputTokens: (totals?.outputTokens ?? 0) + event.outputTokens
  };
}

function addDailyEvent(usage: DailyUsage, event: UsageEvent): DailyUsage {
  return {
    ...usage,
    ...addTotals(usage, event),
    byProvider: {
      ...usage.byProvider,
      [event.provider]: addTotals(usage.byProvider[event.provider], event)
    }
  };
}

async function recordDailyUsage(store: ControlStore, appID: string, events: UsageEvent[]) {
  const eventsByDate = groupBy(events, (event) => toUsageDate(new Date(event.recordedAt)));
  for (const [date, datedEvents] of eventsByDate) {
    const usage = datedEvents.reduce(addDailyEvent, await store.readDailyUsage(appID, date));
    await store.saveDailyUsage(appID, usage);
  }
}

export async function recordUsageBatch(store: ControlStore, events: UsageEvent[]): Promise<number> {
  const recordedEvents: UsageEvent[] = [];
  const eventsByAppMonth = groupBy(
    events,
    (event) => `${event.appID}|${toUsageMonth(new Date(event.recordedAt))}`
  );
  for (const [groupKey, groupedEvents] of eventsByAppMonth) {
    const [appID = '', month = ''] = groupKey.split('|');
    if (!(await store.findApp(appID))) continue;
    const summary = groupedEvents.reduce(addEvent, await store.readUsage(appID, month));
    await store.saveUsage(appID, summary);
    await recordDailyUsage(store, appID, groupedEvents);
    recordedEvents.push(...groupedEvents);
  }
  await noteKeyUses(store, recordedEvents);
  return recordedEvents.length;
}

export async function readMonthlyUsage(
  store: ControlStore,
  ownerID: string,
  appID: string,
  month: string
): Promise<ControlResult<UsageSummary>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return fail(owned.error);
  return succeed(await store.readUsage(appID, month));
}

function listDates(days: number, today: Date): string[] {
  return Array.from({ length: days }, (_, index) =>
    toUsageDate(new Date(today.getTime() - (days - 1 - index) * MILLISECONDS_PER_DAY))
  );
}

function sumProviders(usages: DailyUsage[]): ProviderUsage[] {
  const totals = new Map<string, TokenTotals>();
  for (const usage of usages) {
    for (const [provider, providerTotals] of Object.entries(usage.byProvider)) {
      const current = totals.get(provider);
      totals.set(provider, {
        requestCount: (current?.requestCount ?? 0) + providerTotals.requestCount,
        inputTokens: (current?.inputTokens ?? 0) + providerTotals.inputTokens,
        outputTokens: (current?.outputTokens ?? 0) + providerTotals.outputTokens
      });
    }
  }
  return [...totals]
    .map(([provider, providerTotals]) => ({ provider, ...providerTotals }))
    .sort((first, second) => second.requestCount - first.requestCount);
}

export async function readUsageSeries(
  store: ControlStore,
  ownerID: string,
  appID: string,
  days: number,
  today = new Date()
): Promise<ControlResult<UsageSeries>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return fail(owned.error);
  const usages = await Promise.all(
    listDates(days, today).map((date) => store.readDailyUsage(appID, date))
  );
  const usageDays: UsageDay[] = usages.map(({ byProvider, ...day }) => day);
  return succeed({ days: usageDays, byProvider: sumProviders(usages) });
}
