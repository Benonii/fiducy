import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import './globals.css';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy: your users bring the keys, you never hold them',
  description:
    'Let users bring their own AI keys without storing them. A breach of your app leaks no keys.'
};

export default function RootLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
