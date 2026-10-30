import { CheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { SetupChecklistProps } from './types';

export function SetupChecklist({ steps, onOpenTab }: SetupChecklistProps) {
  return (
    <ol className="grid">
      {steps.map((step) => (
        <li
          key={step.label}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-dashed py-3 last:border-b-0"
        >
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 grid size-4 place-items-center border',
              step.isDone ? 'border-foreground bg-foreground text-background' : 'border-input'
            )}
          >
            {step.isDone ? <CheckIcon className="size-3" strokeWidth={3} /> : null}
          </span>
          <div className="grid gap-0.5">
            <p
              className={cn(
                'text-sm',
                step.isDone ? 'text-ink-quiet line-through' : 'text-foreground'
              )}
            >
              {step.label}
            </p>
            {step.isDone ? null : <p className="text-ink-quiet text-xs">{step.detail}</p>}
          </div>
          {!step.isDone && step.target ? (
            <Button
              size="xs"
              variant="outline"
              onClick={() => step.target && onOpenTab(step.target)}
            >
              Open
            </Button>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
