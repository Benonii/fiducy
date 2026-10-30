import { Spinner } from '@/components/ui/spinner';

import type { ReactNode } from 'react';

interface PageStatusProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function PageStatus({ children, isLoading = false }: PageStatusProps) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground text-sm">
      {isLoading ? <Spinner /> : null}
      {children}
    </p>
  );
}
