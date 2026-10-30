import { buttonVariants } from '@/components/ui/button';

import { SecretReveal } from './SecretReveal';

import type { CreatedAppNoticeProps } from './types';

export function CreatedAppNotice({ created }: CreatedAppNoticeProps) {
  return (
    <section className="grid animate-rise-in gap-4 border border-foreground p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="font-medium text-foreground">{created.app.name} is ready</h2>
          <p className="text-ink-quiet text-xs">
            App ID <code className="text-foreground">{created.app.appID}</code>
          </p>
        </div>
        <a
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
          href={`/dashboard/${created.app.appID}`}
        >
          Open app
        </a>
      </div>
      <SecretReveal appSecret={created.appSecret} />
    </section>
  );
}
