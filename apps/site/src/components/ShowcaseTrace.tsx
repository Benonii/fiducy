import { REQUEST_TRACE } from '@/lib/constants';
import { cn } from '@/lib/utils';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseTrace({ frame }: ShowcaseFrameProps) {
  return (
    <ol className="hidden content-start divide-y divide-dashed divide-frame px-5.5 text-xs lg:grid">
      {REQUEST_TRACE.map((entry, index) => (
        <li
          key={entry.step}
          className={cn(
            'grid gap-0.5 py-2.5 transition-opacity duration-500',
            index < frame.traceCount ? 'opacity-100' : 'opacity-25'
          )}
        >
          <span className="font-semibold">{entry.step}</span>
          <span className="font-mono text-[11px] text-ink-muted">{entry.detail}</span>
        </li>
      ))}
    </ol>
  );
}
