import { AuthPanel } from '@/components/AuthPanel';
import { QueryProvider } from '@/components/QueryProvider';

import type { AuthFrameProps } from './types';

export function AuthFrame({ mode, children }: AuthFrameProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <AuthPanel mode={mode} />
      <main className="flex justify-center px-4 pt-10 pb-16 lg:items-center lg:px-12 lg:py-10">
        <div className="w-full max-w-sm">
          <QueryProvider>{children}</QueryProvider>
        </div>
      </main>
    </div>
  );
}
