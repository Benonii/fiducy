import { fail, succeed } from './result';

import { findOwnedApp } from './appService';
import { UNKNOWN_PROVIDER } from './constants';
import { KEY_NOT_FOUND } from './failures';
import { toUsageMonth } from './usageService';

import type { AppKeyView, ControlResult, ControlStore, StoredKeyEntry } from './types';
import type { KeyEvent, UsageEvent } from './types';

function laterTime(first: string | null, second: string): string {
  return first && first > second ? first : second;
}

export async function noteSavedKey(store: ControlStore, { appID, keyID }: KeyEvent) {
  if (await store.findKeyEntry(appID, keyID)) return;
  await store.saveKeyEntry({
    keyID,
    appID,
    provider: UNKNOWN_PROVIDER,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    status: 'active'
  });
}

export async function noteKeyUse(store: ControlStore, event: UsageEvent) {
  const existing = await store.findKeyEntry(event.appID, event.keyID);
  const entry: StoredKeyEntry = existing ?? {
    keyID: event.keyID,
    appID: event.appID,
    provider: event.provider,
    createdAt: event.recordedAt,
    lastUsedAt: null,
    status: 'active'
  };
  await store.saveKeyEntry({
    ...entry,
    provider: event.provider,
    lastUsedAt: laterTime(entry.lastUsedAt, event.recordedAt)
  });
}

function byMostRecent(first: AppKeyView, second: AppKeyView): number {
  return (second.lastUsedAt ?? second.createdAt).localeCompare(first.lastUsedAt ?? first.createdAt);
}

export async function listAppKeys(
  store: ControlStore,
  ownerID: string,
  appID: string
): Promise<ControlResult<AppKeyView[]>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return fail(owned.error);
  const [entries, usage] = await Promise.all([
    store.listKeyEntries(appID),
    store.readUsage(appID, toUsageMonth(new Date()))
  ]);
  const keys = entries.map(({ appID: _appID, ...entry }) => ({
    ...entry,
    requestCount: usage.requestsByKey[entry.keyID] ?? 0
  }));
  return succeed(keys.sort(byMostRecent));
}

export async function revokeAppKey(
  store: ControlStore,
  ownerID: string,
  appID: string,
  keyID: string
): Promise<ControlResult<string>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return fail(owned.error);
  const entry = await store.findKeyEntry(appID, keyID);
  if (!entry) return fail(KEY_NOT_FOUND);
  await noteRevokedKey(store, appID, keyID);
  return succeed(keyID);
}

export async function noteRevokedKey(store: ControlStore, appID: string, keyID: string) {
  const entry = await store.findKeyEntry(appID, keyID);
  if (entry) await store.saveKeyEntry({ ...entry, status: 'revoked' });
}

export async function listRevokedKeyIDs(store: ControlStore, appID: string): Promise<string[]> {
  const entries = await store.listKeyEntries(appID);
  return entries.filter((entry) => entry.status === 'revoked').map((entry) => entry.keyID);
}

export async function noteKeyEvent(store: ControlStore, event: KeyEvent) {
  if (event.type === 'saved') await noteSavedKey(store, event);
  else await noteRevokedKey(store, event.appID, event.keyID);
}
