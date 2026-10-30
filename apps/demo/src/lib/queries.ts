import { useQuery } from '@tanstack/react-query';

import { fetchDemoConfig } from './client';
import { ensureDemoUser } from './demoUser';

export function useDemoConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => {
      // The demo user cookie must exist before the keys request that follows the config.
      ensureDemoUser();
      return fetchDemoConfig();
    },
    staleTime: Number.POSITIVE_INFINITY
  });
}
