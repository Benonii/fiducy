import { useCallback, useEffect, useState } from 'react';

import type { FiducyKeysState, UserKeySummaryView } from './types';

interface ResponseBody<T> {
  data: T | null;
  message: string;
}

async function callApp<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', ...init });
  const body = (await response.json().catch(() => null)) as ResponseBody<T> | null;
  if (!response.ok || !body?.data)
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  return body.data;
}

/** Lists and revokes the signed-in user's keys through the app's Fiducy handler. */
export function useFiducyKeys(basePath = '/api/fiducy'): FiducyKeysState {
  const [keys, setKeys] = useState<UserKeySummaryView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await callApp<{ keys: UserKeySummaryView[] }>(`${basePath}/keys`);
      setKeys(data.keys);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, [basePath]);

  const revoke = useCallback(
    async (keyID: string) => {
      await callApp(`${basePath}/keys/${keyID}`, { method: 'DELETE' });
      await refresh();
    },
    [basePath, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { keys, isLoading, error, refresh, revoke };
}

export async function saveConnectedKey(
  basePath: string,
  body: unknown
): Promise<UserKeySummaryView> {
  return callApp<UserKeySummaryView>(`${basePath}/keys`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}
