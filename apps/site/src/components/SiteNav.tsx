import { buttonVariants } from '@/components/ui/button';
import { DASHBOARD_URL, DEMO_URL, GITHUB_URL } from '@/lib/constants';
import { NEW_TAB } from '@/lib/site';
import { cn } from '@/lib/utils';

const NAV_LINK_CLASS = cn(
  buttonVariants({ variant: 'ghost', size: 'sm' }),
  'font-normal text-ink-muted hover:text-ink'
);

export function SiteNav() {
  return (
    <header className="flex h-16 items-center justify-between px-gutter">
      <a className="text-lg font-bold tracking-[-0.04em]" href="/">
        Fiducy
      </a>
      <nav aria-label="Main" className="flex items-center gap-1">
        <a className={NAV_LINK_CLASS} href="/docs" {...NEW_TAB}>
          Docs
        </a>
        {DEMO_URL ? (
          <a className={NAV_LINK_CLASS} href={DEMO_URL} {...NEW_TAB}>
            Demo
          </a>
        ) : null}
        <a className={NAV_LINK_CLASS} href={GITHUB_URL} {...NEW_TAB}>
          GitHub
        </a>
        {DASHBOARD_URL ? (
          <a className={cn(buttonVariants({ size: 'sm' }), 'ml-2')} href={DASHBOARD_URL}>
            Dashboard
          </a>
        ) : null}
      </nav>
    </header>
  );
}
