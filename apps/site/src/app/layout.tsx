import '@fontsource-variable/geist/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import '@/shaders/threeui.css';
import './globals.css';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy: your users bring the keys, you never hold them',
  description:
    'Fiducy seals the AI API keys your users bring inside an attested enclave. Your app keeps a handle and never sees a plaintext key.'
};

export default function RootLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
