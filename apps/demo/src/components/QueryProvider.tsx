'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import type { ReactNode } from 'react';

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number): boolean {
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
