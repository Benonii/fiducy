import { fail, succeed } from './result';

import { findOwnedApp } from './appService';

import type { ControlResult, ControlStore, UsageEvent, UsageSummary } from './types';

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

function groupEvents(events: UsageEvent[]): Map<string, UsageEvent[]> {
  const groups = new Map<string, UsageEvent[]>();
  for (const event of events) {
    const groupKey = `${event.appID}|${toUsageMonth(new Date(event.recordedAt))}`;
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), event]);
  }
  return groups;
}

export async function recordUsageBatch(store: ControlStore, events: UsageEvent[]): Promise<number> {
  let recordedCount = 0;
  for (const [groupKey, groupedEvents] of groupEvents(events)) {
    const [appID = '', month = ''] = groupKey.split('|');
    if (!(await store.findApp(appID))) continue;
    const summary = groupedEvents.reduce(addEvent, await store.readUsage(appID, month));
    await store.saveUsage(appID, summary);
    recordedCount += groupedEvents.length;
  }
  return recordedCount;
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
