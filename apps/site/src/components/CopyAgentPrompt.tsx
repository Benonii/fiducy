'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { AGENT_SETUP_PROMPT } from '@/lib/agentPrompt';
import { trackEvent } from '@/lib/analytics';

const COPIED_RESET_MILLISECONDS = 1600;

export function CopyAgentPrompt() {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(AGENT_SETUP_PROMPT).catch(() => null);
    trackEvent('copy_agent_prompt');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_RESET_MILLISECONDS);
  };

  return (
    <Button variant="outline" size="lg" onClick={copy} aria-live="polite">
      {isCopied ? 'Prompt copied' : 'Copy setup prompt for your agent'}
    </Button>
  );
}
