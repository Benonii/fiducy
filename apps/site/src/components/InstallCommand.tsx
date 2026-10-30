'use client';

import { useState } from 'react';

import { INSTALL_COMMAND } from '../lib/constants';

const COPIED_RESET_MILLISECONDS = 1600;

export function InstallCommand() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND).catch(() => null);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_RESET_MILLISECONDS);
  };

  return (
    <div className="install">
      <code>{INSTALL_COMMAND}</code>
      <button type="button" onClick={copy} aria-live="polite">
        {isCopied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
