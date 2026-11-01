import { CopyValue } from './CopyValue';
import { formatDay } from './format';

import type { AppProps } from './types';

export function AppHeader({ app }: AppProps) {
  return (
    <header className="grid gap-3">
      <nav aria-label="Breadcrumb" className="text-ink-quiet text-xs">
        <a className="no-underline hover:text-foreground" href="/dashboard">
          Apps
        </a>
        <span className="mx-1.5">/</span>
        <span className="text-muted-foreground">{app.name}</span>
      </nav>
      <h1 className="font-semibold text-2xl text-foreground tracking-tight">{app.name}</h1>
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <dt className="text-ink-quiet">App ID</dt>
          <dd>
            <CopyValue label="app ID" value={app.appID} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-quiet">Secret</dt>
          <dd>
            <code className="text-foreground">...{app.appSecretPreview}</code>
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-quiet">Created</dt>
          <dd className="text-foreground">{formatDay(app.createdAt)}</dd>
        </div>
      </dl>
    </header>
  );
}
