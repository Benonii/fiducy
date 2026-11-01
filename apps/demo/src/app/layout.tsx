import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import { QueryProvider } from '@/components/QueryProvider';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Acme Chat, a Fiducci demo',
  description: 'An assistant-ui chat where users bring their own model keys through Fiducci'
};

export default function RootLayout({ children }: LayoutProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
