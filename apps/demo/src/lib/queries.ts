import { useQuery } from '@tanstack/react-query';

import { fetchDemoConfig } from './client';

export function useDemoConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: fetchDemoConfig,
    staleTime: Number.POSITIVE_INFINITY
  });
}
