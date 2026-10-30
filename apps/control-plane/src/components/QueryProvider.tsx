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

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: shouldRetry, staleTime: 30_000 } }
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
