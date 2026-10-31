import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import { QueryProvider } from '@/components/QueryProvider';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy demo chat',
  description: 'A chat app where users bring their own OpenAI key through Fiducy'
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <QueryProvider>
      <div className="mx-auto max-w-3xl px-4 pb-16">
        <header className="mb-8 flex items-center justify-between border-b py-5">
          <span className="font-bold font-mono tracking-wider">FIDUCY DEMO</span>
          <span className="text-muted-foreground text-sm">Bring your own key chat</span>
        </header>
        {children}
      </div>
    </QueryProvider>
  );
}
