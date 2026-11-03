import { GITHUB_URL } from '@/lib/constants';
import { NEW_TAB } from '@/lib/site';

const LINK_CLASS = 'hover:text-ink';

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center gap-x-7 gap-y-3 px-gutter py-8 text-sm text-ink-muted">
      <span className="mr-auto font-bold tracking-[-0.04em] text-ink">Fiducy</span>
      <a className={LINK_CLASS} href="/docs" {...NEW_TAB}>
        Docs
      </a>
      <a className={LINK_CLASS} href={GITHUB_URL} {...NEW_TAB}>
        GitHub
      </a>
      <a className={LINK_CLASS} href="/about">
        About
      </a>
      <a className={LINK_CLASS} href="/contact">
        Contact
      </a>
      <a className={LINK_CLASS} href="/privacy">
        Privacy
      </a>
      <a className={LINK_CLASS} href="/llms.txt">
        llms.txt
      </a>
    </footer>
  );
}
