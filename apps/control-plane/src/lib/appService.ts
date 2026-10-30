import { fail, succeed } from './result';

import { SYSTEM_OWNER_ID } from './constants';
import { APP_NOT_FOUND } from './failures';
import { generateAppID, generateAppSecret, hashSecret, previewAppSecret } from './secrets';

import type { AppSettings, AppView, ControlResult, ControlStore } from './types';
import type { CreatedApp, GatewayApp, SeededApp, StoredApp } from './types';

export function toAppView({ appSecretHash, ownerID, ...app }: StoredApp): AppView {
  return app;
}

export function toGatewayApp({
  ownerID,
  appSecretPreview,
  createdAt,
  ...app
}: StoredApp): GatewayApp {
  return app;
}

async function issueAppSecret() {
  const appSecret = generateAppSecret();
  return {
    appSecret,
    appSecretHash: await hashSecret(appSecret),
    appSecretPreview: previewAppSecret(appSecret)
  };
}

export async function findOwnedApp(
  store: ControlStore,
  ownerID: string,
  appID: string
): Promise<ControlResult<StoredApp>> {
  const app = await store.findApp(appID);
  if (!app || app.ownerID !== ownerID) return fail(APP_NOT_FOUND);
  return succeed(app);
}

export async function createApp(
  store: ControlStore,
  ownerID: string,
  settings: AppSettings
): Promise<CreatedApp> {
  const { appSecret, ...secretFields } = await issueAppSecret();
  const app: StoredApp = {
    ...settings,
    ...secretFields,
    appID: generateAppID(),
    ownerID,
    createdAt: new Date().toISOString()
  };
  await store.saveApp(app);
  return { app: toAppView(app), appSecret };
}

export async function listApps(store: ControlStore, ownerID: string): Promise<AppView[]> {
  const apps = await store.listAppsByOwner(ownerID);
  return apps
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt))
    .map(toAppView);
}

export async function updateApp(
  store: ControlStore,
  ownerID: string,
  appID: string,
  changes: Partial<AppSettings>
): Promise<ControlResult<AppView>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return owned;
  const updated = { ...owned.value, ...changes };
  await store.saveApp(updated);
  return succeed(toAppView(updated));
}

export async function rotateAppSecret(
  store: ControlStore,
  ownerID: string,
  appID: string
): Promise<ControlResult<CreatedApp>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return owned;
  const { appSecret, ...secretFields } = await issueAppSecret();
  const updated = { ...owned.value, ...secretFields };
  await store.saveApp(updated);
  return succeed({ app: toAppView(updated), appSecret });
}

export async function deleteApp(
  store: ControlStore,
  ownerID: string,
  appID: string
): Promise<ControlResult<string>> {
  const owned = await findOwnedApp(store, ownerID, appID);
  if (!owned.ok) return owned;
  await store.deleteApp(owned.value);
  return succeed(appID);
}

export async function listGatewayApps(store: ControlStore): Promise<GatewayApp[]> {
  const apps = await store.listAllApps();
  return apps.map(toGatewayApp);
}

// Lets a deployment register its own demo app without a dashboard account. Only the gateway
// token can call this, and the caller sends a hash, never the app secret itself.
export async function seedApp(store: ControlStore, seeded: SeededApp): Promise<GatewayApp> {
  const existing = await store.findApp(seeded.appID);
  const app: StoredApp = {
    ...seeded,
    ownerID: existing?.ownerID ?? SYSTEM_OWNER_ID,
    appSecretPreview: '****',
    createdAt: existing?.createdAt ?? new Date().toISOString()
  };
  await store.saveApp(app);
  return toGatewayApp(app);
}
