'use client';

import { signOut } from '@farm.js/auth/client';

import { Button } from '@/components/ui/button';

import { AppNavigation } from './AppNavigation';
import { GatewayStatusLine } from './GatewayStatusLine';
import { Wordmark } from './Wordmark';

import type { DashboardShellProps } from './types';

async function leave() {
  await signOut();
  window.location.href = '/sign-in';
}

export function DashboardShell({ activeAppID, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="border-b bg-surface md:border-r md:border-b-0">
        <div className="flex flex-col gap-6 px-4 py-4 md:sticky md:top-0 md:h-dvh md:py-5">
          <div className="flex items-center justify-between px-2">
            <Wordmark />
            <Button className="md:hidden" size="xs" variant="ghost" onClick={leave}>
              Sign out
            </Button>
          </div>
          <div className="hidden md:block">
            <AppNavigation activeAppID={activeAppID} />
          </div>
          <div className="mt-auto hidden gap-4 border-t border-dashed px-2 pt-4 md:grid">
            <GatewayStatusLine />
            <Button className="justify-self-start" size="xs" variant="ghost" onClick={leave}>
              Sign out
            </Button>
          </div>
        </div>
      </aside>
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-8 md:py-10">{children}</div>
    </div>
  );
}
