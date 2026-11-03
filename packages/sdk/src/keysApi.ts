import type { WidgetSealedRecord } from '@fiducy/widget';

import type { GatewayProvider, UserKeySummaryView } from './types.ts';

interface ResponseBody<T> {
  data: T | null;
  message: string;
}

/** Window event fired after a key is saved, so key lists can refresh. */
export const FIDUCY_KEYS_CHANGED = 'fiducy:keys-changed';

export async function callApp<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...init });
  const body = (await response.json().catch(() => null)) as ResponseBody<T> | null;
  if (!response.ok || !body?.data)
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  return body.data;
}

export function notifyKeysChanged(basePath: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(FIDUCY_KEYS_CHANGED, { detail: { basePath } }));
}

/** Saves a connected key through your app's Fiducy route. No React Query needed. */
export async function saveConnectedKey(
  body: { provider: GatewayProvider; handle: string; record?: WidgetSealedRecord },
  basePath = '/api/fiducy'
): Promise<UserKeySummaryView> {
  const key = await callApp<UserKeySummaryView>(`${basePath}/keys`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  notifyKeysChanged(basePath);
  return key;
}
