import { SHOWCASE_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseSteps({ frame }: ShowcaseFrameProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-dashed border-frame px-5.5 py-3 text-xs">
      {SHOWCASE_STEPS.map((step, index) => (
        <li
          key={step.value}
          className={cn(
            'flex items-center gap-2 transition-colors duration-300',
            frame.activeStep === step.value ? 'text-ink' : 'text-ink-quiet'
          )}
        >
          <span className="font-mono">0{index + 1}</span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}
