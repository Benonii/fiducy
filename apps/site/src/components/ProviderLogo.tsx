import { PROVIDER_LOGO_PATHS } from '@/lib/providerLogos';

import type { ProviderLogoProps } from '@/types';

export function ProviderLogo({ name }: ProviderLogoProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 font-[650]">
      <svg viewBox="0 0 24 24" className="size-4.5 fill-ink" aria-hidden="true">
        <path d={PROVIDER_LOGO_PATHS[name] ?? ''} />
      </svg>
      {name}
    </span>
  );
}
