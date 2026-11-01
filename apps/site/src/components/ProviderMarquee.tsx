import { ProviderLogo } from '@/components/ProviderLogo';
import { PROVIDERS } from '@/lib/constants';

const MARQUEE_COPIES = ['first', 'second'] as const;
const FADE_MASK =
  '[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]';

export function ProviderMarquee() {
  return (
    <div className={`min-w-0 overflow-hidden ${FADE_MASK}`}>
      <ul className="flex w-max animate-marquee motion-reduce:animate-none">
        {MARQUEE_COPIES.map((copy) => (
          <li key={copy} aria-hidden={copy === 'second'} className="flex gap-8 pr-8">
            {PROVIDERS.map((provider) => (
              <ProviderLogo key={provider} name={provider} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
