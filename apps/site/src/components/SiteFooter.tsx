import { GITHUB_URL } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-7 px-gutter py-8 text-sm text-ink-muted">
      <span className="mr-auto font-bold tracking-[-0.04em] text-ink">Fiducci</span>
      <a className="hover:text-ink" href="/docs">
        Docs
      </a>
      <a className="hover:text-ink" href={GITHUB_URL}>
        GitHub
      </a>
      <a className="hover:text-ink" href="/llms.txt">
        llms.txt
      </a>
    </footer>
  );
}
