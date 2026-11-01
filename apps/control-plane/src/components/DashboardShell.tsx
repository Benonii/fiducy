'use client';

import { signOut } from '@farm.js/auth/client';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { AppNavigation } from './AppNavigation';
import { GatewayStatusLine } from './GatewayStatusLine';
import { Wordmark } from './Wordmark';

import type { DashboardShellProps, MobileMenuProps, SidebarFooterProps } from './types';

async function leave() {
  await signOut();
  window.location.href = '/sign-in';
}

function SidebarFooter({ className }: SidebarFooterProps) {
  return (
    <div className={cn('grid gap-4', className)}>
      <GatewayStatusLine />
      <Button className="justify-self-start" size="xs" variant="ghost" onClick={leave}>
        Sign out
      </Button>
    </div>
  );
}

function MobileMenu({ activeAppID }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger render={<Button aria-label="Open menu" size="icon" variant="ghost" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetPopup className="h-full" side="left">
        <SheetHeader>
          <SheetTitle render={<Wordmark />} />
          <SheetDescription className="sr-only">Your apps and the gateway status</SheetDescription>
        </SheetHeader>
        <SheetPanel className="flex-1">
          <AppNavigation activeAppID={activeAppID} />
        </SheetPanel>
        <SheetFooter className="border-t border-dashed">
          <SidebarFooter className="w-full" />
        </SheetFooter>
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
          <AppNavigation activeAppID={activeAppID} />
          <SidebarFooter className="mt-auto border-t border-dashed px-2 pt-4" />
        </div>
      </aside>
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-8 md:py-10">{children}</div>
    </div>
  );
}
