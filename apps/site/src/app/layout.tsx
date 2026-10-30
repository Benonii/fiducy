import '@fontsource-variable/archivo/wdth.css';
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
