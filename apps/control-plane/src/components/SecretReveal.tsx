'use client';

import { useState } from 'react';

interface SecretRevealProps {
  appSecret: string;
}

export function SecretReveal({ appSecret }: SecretRevealProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copySecret() {
    await navigator.clipboard.writeText(appSecret);
    setIsCopied(true);
  }

  return (
    <div className="notice stack">
      <strong>
        Copy your app secret now. Fiducy only stores its hash and cannot show it again.
      </strong>
      <div className="secret" data-testid="app-secret">
        {appSecret}
      </div>
      <div className="row">
        <button className="secondary" onClick={copySecret} type="button">
          {isCopied ? 'Copied' : 'Copy secret'}
        </button>
      </div>
    </div>
  );
}
