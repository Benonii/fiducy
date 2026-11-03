import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { FIDUCY_KEYS_CHANGED, callApp } from './keysApi.ts';

import type { FiducyKeysState, UserKeySummaryView } from './types.ts';

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

  // ConnectKeyWidget saves without React Query and announces it with a window event.
  useEffect(() => {
    const onChanged = (event: Event) => {
      const changedPath = (event as CustomEvent<{ basePath: string }>).detail?.basePath;
      if (changedPath === basePath)
        queryClient.invalidateQueries({ queryKey: fiducyKeysQueryKey(basePath) });
    };
    window.addEventListener(FIDUCY_KEYS_CHANGED, onChanged);
    return () => window.removeEventListener(FIDUCY_KEYS_CHANGED, onChanged);
  }, [basePath, queryClient]);

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
