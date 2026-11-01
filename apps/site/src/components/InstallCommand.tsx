'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { INSTALL_COMMAND } from '@/lib/constants';

const COPIED_RESET_MILLISECONDS = 1600;

export function InstallCommand() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND).catch(() => null);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_RESET_MILLISECONDS);
  };

  return (
    <div className="flex h-10 max-w-full min-w-0 items-center gap-1 max-sm:w-full rounded-lg border border-input bg-white pr-1 pl-3 shadow-xs/5 sm:h-9">
      <span className="font-mono text-ink-quiet select-none">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[0.8125rem] whitespace-nowrap text-ink-body">
        {INSTALL_COMMAND}
      </code>
      <Button variant="ghost" size="xs" onClick={copy} aria-live="polite">
        {isCopied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}
