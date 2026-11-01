import { hashSecret } from './hashing';

import type { SealedRecord } from '@fiducy/core';
import type { AppDirectory, AppRegistration, KeyStore } from './types';
import type { RegisteredApp, UsageEvent, UsageLedger } from './types';

export function createMemoryKeyStore(): KeyStore {
  const records = new Map<string, SealedRecord>();
  return {
    saveRecord: async (record) => {
      records.set(record.keyID, record);
    },
    findRecord: async (keyID) => records.get(keyID) ?? null,
    deleteRecord: async (keyID) => records.delete(keyID)
  };
}

export async function createMemoryAppDirectory(
  registrations: AppRegistration[]
): Promise<AppDirectory> {
  const appsByID = new Map<string, RegisteredApp>();
  const appsBySecretHash = new Map<string, RegisteredApp>();
  for (const { appSecret, ...app } of registrations) {
    appsByID.set(app.appID, app);
    appsBySecretHash.set(await hashSecret(appSecret), app);
  }
  return {
    findApp: async (appID) => appsByID.get(appID) ?? null,
    findAppBySecret: async (appSecret) => appsBySecretHash.get(await hashSecret(appSecret)) ?? null
  };
}

function isSameMonth(first: Date, second: Date): boolean {
  return (
    first.getUTCFullYear() === second.getUTCFullYear() &&
    first.getUTCMonth() === second.getUTCMonth()
  );
}

export function countMonthEvents(events: UsageEvent[], appID: string, keyID: string): number {
  const now = new Date();
  return events.filter(
    (event) => event.appID === appID && event.keyID === keyID && isSameMonth(event.recordedAt, now)
  ).length;
}

export function createMemoryUsageLedger(): UsageLedger & { listEvents: () => UsageEvent[] } {
  const events: UsageEvent[] = [];
  return {
    recordUsage: async (event) => {
      events.push(event);
    },
    countRequestsThisMonth: async (appID, keyID) => countMonthEvents(events, appID, keyID),
    listEvents: () => [...events]
  };
}
