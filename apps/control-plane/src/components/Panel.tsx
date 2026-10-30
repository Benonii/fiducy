import { cn } from '@/lib/utils';

import type { PanelProps } from './types';

export function Panel({ title, description, action, className, children }: PanelProps) {
  return (
    <section className={cn('grid content-start gap-4 border bg-background p-5', className)}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="grid min-w-0 flex-1 basis-48 gap-1">
          <h2 className="font-medium text-foreground text-sm">{title}</h2>
          {description ? (
            <p className="text-ink-quiet text-xs leading-relaxed">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
