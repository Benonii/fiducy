'use client';

import { useUsage } from '@/lib/queries';

import { formatCompact, formatDay } from './format';

import type { AppProps } from './types';

export function AppCard({ app }: AppProps) {
  const usage = useUsage(app.appID);
  const keyCount = Object.keys(usage.data?.requestsByKey ?? {}).length;
  return (
    <article className="group relative grid gap-6 border bg-background p-5 transition-colors hover:border-foreground">
      <div className="grid gap-1">
        <h2 className="font-medium text-foreground">
          <a className="no-underline after:absolute after:inset-0" href={`/dashboard/${app.appID}`}>
            {app.name}
          </a>
        </h2>
        <code className="text-ink-quiet text-xs">{app.appID}</code>
      </div>
      <dl className="grid grid-cols-3 gap-3 border-t border-dashed pt-4">
        <div className="grid gap-0.5">
          <dt className="text-ink-quiet text-xs">Requests</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {usage.data ? formatCompact(usage.data.requestCount) : '-'}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-quiet text-xs">Keys used</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {usage.data ? keyCount : '-'}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-ink-quiet text-xs">Created</dt>
          <dd className="text-foreground">{formatDay(app.createdAt)}</dd>
        </div>
      </dl>
    </article>
  );
}
