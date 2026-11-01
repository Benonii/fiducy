'use client';

import { signOut } from '@farm.js/auth/client';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

import { AppNavigation } from './AppNavigation';
import { GatewayStatusLine } from './GatewayStatusLine';
import { Wordmark } from './Wordmark';

import type { DashboardShellProps, SidebarBodyProps } from './types';

async function leave() {
  await signOut();
  window.location.href = '/sign-in';
}

function SidebarBody({ activeAppID }: SidebarBodyProps) {
  return (
    <>
      <AppNavigation activeAppID={activeAppID} />
      <div className="mt-auto grid gap-4 border-t border-dashed px-2 pt-4">
        <GatewayStatusLine />
        <Button className="justify-self-start" size="xs" variant="ghost" onClick={leave}>
          Sign out
        </Button>
      </div>
    </>
  );
}

function MobileMenu({ activeAppID }: SidebarBodyProps) {
  return (
    <Sheet>
      <SheetTrigger render={<Button aria-label="Open menu" size="icon" variant="ghost" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetPopup side="left">
        <SheetHeader>
          <SheetTitle render={<Wordmark />} />
          <SheetDescription className="sr-only">Your apps and the gateway status</SheetDescription>
        </SheetHeader>
        <SheetPanel className="flex min-h-0 flex-1 flex-col gap-6">
          <SidebarBody activeAppID={activeAppID} />
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}

export function DashboardShell({ activeAppID, children }: DashboardShellProps) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-20 border-b bg-surface md:static md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <Wordmark />
          <MobileMenu activeAppID={activeAppID} />
        </div>
        <div className="hidden flex-col gap-6 px-4 py-5 md:sticky md:top-0 md:flex md:h-dvh">
          <div className="px-2">
            <Wordmark />
          </div>
          <SidebarBody activeAppID={activeAppID} />
        </div>
      </aside>
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 md:py-10">{children}</div>
    </div>
  );
}
