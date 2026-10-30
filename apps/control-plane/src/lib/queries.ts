import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requestControlPlane } from './client';

import type { AppSettings, AppView, CreatedApp, UsageSummary } from './types';

export const queryKeys = {
  apps: ['apps'] as const,
  app: (appID: string) => ['apps', appID] as const,
  usage: (appID: string) => ['apps', appID, 'usage'] as const,
  config: ['config'] as const
};

export function useApps() {
  return useQuery({
    queryKey: queryKeys.apps,
    queryFn: () => requestControlPlane<AppView[]>('/api/apps')
  });
}

export function useApp(appID: string) {
  return useQuery({
    queryKey: queryKeys.app(appID),
    queryFn: () => requestControlPlane<AppView>(`/api/apps/${appID}`)
  });
}

export function useUsage(appID: string) {
  return useQuery({
    queryKey: queryKeys.usage(appID),
    queryFn: () => requestControlPlane<UsageSummary>(`/api/apps/${appID}/usage`)
  });
}

export function useGatewayURL() {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => requestControlPlane<{ gatewayURL: string }>('/api/config'),
    select: (config) => config.gatewayURL,
    staleTime: Number.POSITIVE_INFINITY
  });
}

export function useCreateApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AppSettings) =>
      requestControlPlane<CreatedApp>('/api/apps', {
        method: 'POST',
        body: JSON.stringify(settings)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apps })
  });
}

export function useUpdateApp(appID: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AppSettings) =>
      requestControlPlane<AppView>(`/api/apps/${appID}`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }),
    onSuccess: (app) => {
      queryClient.setQueryData(queryKeys.app(appID), app);
      queryClient.invalidateQueries({ queryKey: queryKeys.apps, exact: true });
    }
  });
}

export function useRotateSecret(appID: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      requestControlPlane<CreatedApp>(`/api/apps/${appID}/secret`, { method: 'POST' }),
    onSuccess: ({ app }) => {
      queryClient.setQueryData(queryKeys.app(appID), app);
      queryClient.invalidateQueries({ queryKey: queryKeys.apps, exact: true });
    }
  });
}

export function useDeleteApp(appID: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestControlPlane<null>(`/api/apps/${appID}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.app(appID) });
      queryClient.invalidateQueries({ queryKey: queryKeys.apps, exact: true });
    }
  });
}
