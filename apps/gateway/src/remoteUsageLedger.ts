import { GATEWAY_USAGE_PATH, MAXIMUM_USAGE_BATCH_SIZE } from './constants';
import { callControlPlane, normalizeError } from './controlPlane';
import { createMemoryUsageLedger } from './memoryStores';

import type { FlushableUsageLedger, RemoteUsageLedgerOptions, UsageEvent } from './types';

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

export function createRemoteUsageLedger(options: RemoteUsageLedgerOptions): FlushableUsageLedger {
  const localLedger = createMemoryUsageLedger();
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

  const timer = setInterval(flush, options.flushIntervalMilliseconds);

  return {
    recordUsage: async (event) => {
      await localLedger.recordUsage(event);
      queuedEvents.push(event);
    },
    countRequestsThisMonth: localLedger.countRequestsThisMonth,
    flush,
    stop: async () => {
      clearInterval(timer);
      await flush();
    }
  };
}
