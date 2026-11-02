import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { FiducyKeysState, UserKeySummaryView } from './types.ts';

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

export function fiducyKeysQueryKey(basePath = '/api/fiducy') {
  return ['fiducy', basePath, 'keys'] as const;
}

export function useFiducyKeys(basePath = '/api/fiducy'): FiducyKeysState {
  const queryClient = useQueryClient();
  const queryKey = fiducyKeysQueryKey(basePath);
  const keysQuery = useQuery({
    queryKey,
    queryFn: () => callApp<{ keys: UserKeySummaryView[] }>(`${basePath}/keys`),
    select: (data) => data.keys
  });
  const revokeMutation = useMutation({
    mutationFn: (keyID: string) => callApp(`${basePath}/keys/${keyID}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  return {
    keys: keysQuery.data ?? [],
    isLoading: keysQuery.isPending,
    error: keysQuery.error?.message ?? revokeMutation.error?.message ?? null,
    refresh: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
    revoke: async (keyID) => {
      await revokeMutation.mutateAsync(keyID);
    }
  };
}

export function useSaveConnectedKey(basePath = '/api/fiducy') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      callApp<UserKeySummaryView>(`${basePath}/keys`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fiducyKeysQueryKey(basePath) })
  });
}
