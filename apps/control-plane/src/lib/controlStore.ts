import { APP_NAMESPACE, OWNER_NAMESPACE, USAGE_NAMESPACE } from './constants';

import type { ControlStore, KeyValueStore, StoredApp, UsageSummary } from './types';

function createEmptyUsage(month: string): UsageSummary {
  return { month, requestCount: 0, inputTokens: 0, outputTokens: 0, requestsByKey: {} };
}

function lastKeySegment(key: string): string {
  return key.split(':').at(-1) ?? key;
}

export function createControlStore(keyValueStore: KeyValueStore): ControlStore {
  const findApp = async (appID: string) =>
    ((await keyValueStore.getItem(`${APP_NAMESPACE}:${appID}`)) as StoredApp | null) ?? null;

  const findApps = async (appIDs: string[]) => {
    const apps = await Promise.all(appIDs.map(findApp));
    return apps.filter((app): app is StoredApp => app !== null);
  };

  return {
    saveApp: async (app) => {
      await keyValueStore.setItem(`${APP_NAMESPACE}:${app.appID}`, app);
      await keyValueStore.setItem(`${OWNER_NAMESPACE}:${app.ownerID}:${app.appID}`, true);
    },
    findApp,
    deleteApp: async (app) => {
      await keyValueStore.removeItem(`${APP_NAMESPACE}:${app.appID}`);
      await keyValueStore.removeItem(`${OWNER_NAMESPACE}:${app.ownerID}:${app.appID}`);
    },
    listAppsByOwner: async (ownerID) => {
      const keys = await keyValueStore.getKeys(`${OWNER_NAMESPACE}:${ownerID}`);
      return findApps(keys.map(lastKeySegment));
    },
    listAllApps: async () => {
      const keys = await keyValueStore.getKeys(APP_NAMESPACE);
      return findApps(keys.map(lastKeySegment));
    },
    readUsage: async (appID, month) => {
      const stored = await keyValueStore.getItem(`${USAGE_NAMESPACE}:${appID}:${month}`);
      return (stored as UsageSummary | null) ?? createEmptyUsage(month);
    },
    saveUsage: async (appID, summary) => {
      await keyValueStore.setItem(`${USAGE_NAMESPACE}:${appID}:${summary.month}`, summary);
    }
  };
}

export function createMemoryKeyValueStore(): KeyValueStore {
  const entries = new Map<string, unknown>();
  return {
    getItem: async (key) => structuredClone(entries.get(key)) ?? null,
    setItem: async (key, value) => {
      entries.set(key, structuredClone(value));
    },
    removeItem: async (key) => {
      entries.delete(key);
    },
    getKeys: async (base = '') =>
      [...entries.keys()].filter((key) => !base || key.startsWith(`${base}:`))
  };
}
