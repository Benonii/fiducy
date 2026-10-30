import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import { QueryProvider } from '@/components/QueryProvider';
import { buttonVariants } from '@/components/ui/button';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy',
  description: 'Key custody for apps that let users bring their own AI keys'
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <QueryProvider>
      <div className="mx-auto max-w-3xl px-4 pb-16">
        <header className="mb-8 flex items-center justify-between border-b py-5">
          <a className="font-mono font-bold tracking-wider text-foreground no-underline" href="/">
            FIDUCY
          </a>
          <nav>
            <a className={buttonVariants({ variant: 'ghost', size: 'sm' })} href="/dashboard">
              Dashboard
            </a>
          </nav>
        </header>
        {children}
      </div>
    </QueryProvider>
  );
}
