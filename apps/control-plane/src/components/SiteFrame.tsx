import { buttonVariants } from '@/components/ui/button';

import { QueryProvider } from './QueryProvider';
import { Wordmark } from './Wordmark';

import type { FrameProps } from './types';

export function SiteFrame({ children }: FrameProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <header className="mb-10 flex items-center justify-between border-b py-5">
        <Wordmark />
        <nav>
          <a className={buttonVariants({ variant: 'ghost', size: 'sm' })} href="/dashboard">
            Dashboard
          </a>
        </nav>
      </header>
      {/* Farm renders only the page on client navigation, without the root layout's provider */}
      <QueryProvider>{children}</QueryProvider>
    </div>
  );
}
