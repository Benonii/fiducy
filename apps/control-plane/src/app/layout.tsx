import '@fontsource-variable/lexend/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import { QueryProvider } from '@/components/QueryProvider';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducci',
  description: 'Key custody for apps that let users bring their own AI keys'
};

export default function RootLayout({ children }: LayoutProps) {
  return <QueryProvider>{children}</QueryProvider>;
}
