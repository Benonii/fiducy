import { GATEWAY_USAGE_COUNT_PATH, GATEWAY_USAGE_PATH } from './constants';
import { MAXIMUM_USAGE_BATCH_SIZE } from './constants';
import { callControlPlane, normalizeError } from './controlPlane';
import { countMonthEvents, createMemoryUsageLedger } from './memoryStores';

import type { FlushableUsageLedger, RemoteUsageLedgerOptions, UsageEvent } from './types';
import type { RemoteRequestCount } from './types';

function toUsagePayload(event: UsageEvent) {
  return {
    appID: event.appID,
    keyID: event.keyID,
    provider: event.provider,
    inputTokens: event.usage.inputTokens,
    outputTokens: event.usage.outputTokens,
    recordedAt: event.recordedAt.toISOString()
  };
}

function toMonthKey(appID: string, keyID: string): string {
  return `${appID}|${keyID}|${new Date().toISOString().slice(0, 7)}`;
}

async function fetchRemoteRequestCount(
  options: RemoteUsageLedgerOptions,
  appID: string,
  keyID: string
): Promise<number> {
  const query = new URLSearchParams({ appID, keyID });
  const path = `${GATEWAY_USAGE_COUNT_PATH}?${query}`;
  const remoteCount = (await callControlPlane(options, path)) as RemoteRequestCount;
  return remoteCount.requestCount;
}

export function createRemoteUsageLedger(options: RemoteUsageLedgerOptions): FlushableUsageLedger {
  const localLedger = createMemoryUsageLedger();
  const earlierRequestCounts = new Map<string, Promise<number>>();
  let queuedEvents: UsageEvent[] = [];

  const flush = async () => {
    const batch = queuedEvents.slice(0, MAXIMUM_USAGE_BATCH_SIZE);
    if (batch.length === 0) return 0;
    queuedEvents = queuedEvents.slice(batch.length);
    try {
      await callControlPlane(options, GATEWAY_USAGE_PATH, {
        method: 'POST',
        body: JSON.stringify({ events: batch.map(toUsagePayload) })
      });
      return batch.length;
    } catch (error) {
      queuedEvents = [...batch, ...queuedEvents];
      console.error(`Could not send usage to the control plane: ${normalizeError(error)}`);
      return 0;
    }
  };

  const loadEarlierRequestCount = async (appID: string, keyID: string) => {
    const remoteCount = await fetchRemoteRequestCount(options, appID, keyID);
    const localCount = await localLedger.countRequestsThisMonth(appID, keyID);
    const sentCount = localCount - countMonthEvents(queuedEvents, appID, keyID);
    return remoteCount - sentCount;
  };

  const readEarlierRequestCount = (appID: string, keyID: string) => {
    const monthKey = toMonthKey(appID, keyID);
    const cached = earlierRequestCounts.get(monthKey);
    if (cached) return cached;
    const pending = loadEarlierRequestCount(appID, keyID).catch((error: unknown) => {
      earlierRequestCounts.delete(monthKey);
      console.error(`Could not load the request count for ${keyID}: ${normalizeError(error)}`);
      return 0;
    });
    earlierRequestCounts.set(monthKey, pending);
    return pending;
  };

  const timer = setInterval(flush, options.flushIntervalMilliseconds);

  return {
    recordUsage: async (event) => {
      await localLedger.recordUsage(event);
      queuedEvents.push(event);
    },
    countRequestsThisMonth: async (appID, keyID) => {
      const earlierCount = await readEarlierRequestCount(appID, keyID);
      return earlierCount + (await localLedger.countRequestsThisMonth(appID, keyID));
    },
    flush,
    stop: async () => {
      clearInterval(timer);
      await flush();
    }
  };
}
