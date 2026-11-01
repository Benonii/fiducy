import { PROVIDERS } from '@/lib/constants';

const CELL_CLASS = 'flex min-h-19 items-center px-5';
const TERM_CLASS = `${CELL_CLASS} text-xs text-ink-muted`;
const VALUE_CLASS = `${CELL_CLASS} justify-center font-[650]`;
const COMPACT_TERM_CLASS = 'text-xs text-ink-muted';

function CompactProviderStrip() {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2.5 px-5 py-5 text-sm md:hidden">
      <dt className={COMPACT_TERM_CLASS}>Works with</dt>
      <dd className="font-[650]">{PROVIDERS.join(', ')}</dd>
      <dt className={COMPACT_TERM_CLASS}>Runs on</dt>
      <dd className="font-[650]">AWS Nitro</dd>
    </dl>
  );
}

export function ProviderStrip() {
  return (
    <div>
      <CompactProviderStrip />
      <dl className="grid grid-cols-4 [&>*]:border-dashed [&>*]:border-frame max-md:hidden md:[&>*:nth-child(n+5)]:border-t md:[&>*:not(:nth-child(4n+1))]:border-l lg:grid-cols-7 lg:[&>*]:border-t-0 lg:[&>*:not(:first-child)]:border-l">
        <dt className={TERM_CLASS}>Works with</dt>
        {PROVIDERS.map((provider) => (
          <dd key={provider} className={VALUE_CLASS}>
            {provider}
          </dd>
        ))}
        <dt className={TERM_CLASS}>Runs on</dt>
        <dd className={VALUE_CLASS}>AWS Nitro</dd>
      </dl>
    </div>
  );
}
