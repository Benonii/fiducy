import './globals.css';

import type { LayoutProps } from '@farm.js/core';

export const metadata = {
  title: 'Fiducy demo chat',
  description: 'A chat app where users bring their own OpenAI key through Fiducy'
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <span className="wordmark">FIDUCY DEMO</span>
        <span className="hint">Bring your own key chat</span>
      </header>
      {children}
    </div>
  );
}
