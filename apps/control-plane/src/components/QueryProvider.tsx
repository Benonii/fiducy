'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { ControlPlaneError } from '@/lib/client';

import type { ReactNode } from 'react';

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ControlPlaneError && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: shouldRetry, staleTime: 30_000 } }
  });
}

let browserQueryClient: QueryClient | undefined;

// One client per browser tab, so a page that wraps itself (see SiteFrame) shares the
// layout's cache. On the server each render gets its own client.
function getQueryClient() {
  if (typeof window === 'undefined') return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
