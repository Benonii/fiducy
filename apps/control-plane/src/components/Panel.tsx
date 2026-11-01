'use client';

import { ChevronDownIcon } from 'lucide-react';

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsPhone } from '@/hooks/useIsPhone';
import { cn } from '@/lib/utils';

import type { PanelProps } from './types';

function PanelHeading({ title, description }: Pick<PanelProps, 'title' | 'description'>) {
  return (
    <div className="grid min-w-0 flex-1 basis-48 gap-1 text-left">
      <h2 className="font-medium text-foreground text-sm">{title}</h2>
      {description ? <p className="text-ink-quiet text-xs leading-relaxed">{description}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  className,
  collapsible = false,
  defaultOpen = true,
  children
}: PanelProps) {
  const isPhone = useIsPhone();
  const sectionClass = cn('grid content-start gap-4 border bg-background p-5', className);

  if (collapsible && isPhone) {
    return (
      <Collapsible className={sectionClass} defaultOpen={defaultOpen}>
        <CollapsibleTrigger className="group flex w-full items-start justify-between gap-3 text-left">
          <PanelHeading title={title} description={description} />
          <ChevronDownIcon
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-ink-quiet transition-transform group-data-panel-open:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsiblePanel className="grid gap-4 data-closed:hidden">
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
          {children}
        </CollapsiblePanel>
      </Collapsible>
    );
  }

  return (
    <section className={sectionClass}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <PanelHeading title={title} description={description} />
        {action}
      </header>
      {children}
    </section>
  );
}
