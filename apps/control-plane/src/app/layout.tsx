import './globals.css';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy',
  description: 'Key custody for apps that let users bring their own AI keys'
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <a className="wordmark" href="/">
          FIDUCY
        </a>
        <nav className="row">
          <a href="/dashboard">Dashboard</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
