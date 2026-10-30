import { PROVIDERS } from '@/lib/constants';

const CELL_CLASS = 'flex min-h-19 items-center px-5 max-md:min-h-14';
const TERM_CLASS = `${CELL_CLASS} text-xs text-ink-muted`;
const VALUE_CLASS = `${CELL_CLASS} justify-center font-[650]`;

export function ProviderStrip() {
  return (
    <dl className="grid grid-cols-2 [&>*]:border-dashed [&>*]:border-frame max-md:[&>*:nth-child(even)]:border-l max-md:[&>*:nth-child(n+3)]:border-t md:grid-cols-4 md:[&>*:nth-child(n+5)]:border-t md:[&>*:not(:nth-child(4n+1))]:border-l lg:grid-cols-7 lg:[&>*]:border-t-0 lg:[&>*:not(:first-child)]:border-l">
      <dt className={TERM_CLASS}>Works with</dt>
      {PROVIDERS.map((provider) => (
        <dd key={provider} className={VALUE_CLASS}>
          {provider}
        </dd>
      ))}
      <dt className={TERM_CLASS}>Runs on</dt>
      <dd className={VALUE_CLASS}>AWS Nitro</dd>
    </dl>
  );
}
