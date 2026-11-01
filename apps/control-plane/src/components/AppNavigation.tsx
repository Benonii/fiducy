'use client';

import { useApps } from '@/lib/queries';
import { cn } from '@/lib/utils';

import type { AppNavigationProps } from './types';

const LINK_CLASS =
  'flex items-center gap-2.5 px-2 py-1.5 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground';

export function AppNavigation({ activeAppID }: AppNavigationProps) {
  const apps = useApps();
  return (
    <nav aria-label="Apps" className="grid gap-0.5">
      <a
        className={cn(LINK_CLASS, !activeAppID && 'bg-muted font-medium text-foreground')}
        href="/dashboard"
      >
        All apps
      </a>
      <p className="mt-5 mb-1 px-2 text-ink-quiet text-xs">Your apps</p>
      {apps.data?.map((app) => (
        <a
          key={app.appID}
          className={cn(LINK_CLASS, app.appID === activeAppID && 'bg-muted text-foreground')}
          href={`/dashboard/${app.appID}`}
        >
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center border bg-background font-medium text-[10px] text-foreground uppercase"
          >
            {app.name.slice(0, 1)}
          </span>
          <span className="truncate">{app.name}</span>
        </a>
      ))}
      {apps.data?.length === 0 ? <p className="px-2 text-ink-quiet text-xs">None yet</p> : null}
    </nav>
  );
}
