import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import { QueryProvider } from '@/components/QueryProvider';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Acme Chat, a Fiducy demo',
  description: 'An assistant-ui chat where users bring their own model keys through Fiducy',
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' }
};

export default function RootLayout({ children }: LayoutProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
