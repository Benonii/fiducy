'use client';

import { ConvexError } from 'convex/values';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';
import { getConvexClient } from '@/lib/convexClient';

import { api } from '@/lib/convexApi';

import type { WaitlistFormProps, WaitlistStatus } from '@/types';
import type { FormEvent } from 'react';

const MESSAGES: Record<WaitlistStatus, string> = {
  idle: 'No spam. One email when the managed service opens.',
  sending: 'Adding you',
  joined: 'You are on the list. We will email you when it opens.',
  already_joined: 'You are already on the list.',
  error: 'That did not go through. Check the address and try again.'
};

function describeError(error: unknown): string {
  return error instanceof ConvexError && typeof error.data === 'string'
    ? error.data
    : MESSAGES.error;
}

export function WaitlistForm({ source }: WaitlistFormProps) {
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const [message, setMessage] = useState(MESSAGES.idle);

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    const client = getConvexClient();
    if (!client) return finish('error', 'The waitlist is not open yet.');
    setStatus('sending');
    setMessage(MESSAGES.sending);
    trackEvent('waitlist_submit', { source });
    try {
      const result = await client.mutation(api.waitlist.join, {
        email,
        source,
        referrer: document.referrer || undefined
      });
      trackEvent(result === 'joined' ? 'waitlist_join' : 'waitlist_repeat', { source });
      finish(result, MESSAGES[result]);
    } catch (error) {
      finish('error', describeError(error));
    }
  }

  function finish(nextStatus: WaitlistStatus, nextMessage: string) {
    setStatus(nextStatus);
    setMessage(nextMessage);
  }

  const isDone = status === 'joined' || status === 'already_joined';
  return (
    <form className="grid w-full max-w-md gap-2" onSubmit={join}>
      <div className="flex gap-2 max-sm:flex-col">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          aria-label="Email address"
          disabled={status === 'sending' || isDone}
        />
        <Button type="submit" className="shrink-0" loading={status === 'sending'} disabled={isDone}>
          {isDone ? 'On the list' : 'Join the waitlist'}
        </Button>
      </div>
      <p
        aria-live="polite"
        className={status === 'error' ? 'text-xs text-destructive' : 'text-xs text-ink-muted'}
      >
        {message}
      </p>
    </form>
  );
}
