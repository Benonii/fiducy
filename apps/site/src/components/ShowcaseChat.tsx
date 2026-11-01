import { SHOWCASE_QUESTION } from '@/lib/constants';
import { cn } from '@/lib/utils';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseChat({ frame }: ShowcaseFrameProps) {
  const sentQuestion = frame.isQuestionSent ? SHOWCASE_QUESTION : '';
  return (
    <div className="grid min-h-[300px] content-end gap-3 p-5.5 max-md:min-h-[260px]">
      {sentQuestion ? (
        <p className="max-w-[90%] animate-rise-in justify-self-end rounded-lg bg-wash px-3 py-2">
          {sentQuestion}
        </p>
      ) : null}
      {frame.answer ? (
        <p className="max-w-[90%] leading-[1.55] text-ink-body">{frame.answer}</p>
      ) : null}
      <div className="mt-2 flex justify-between gap-2 rounded-lg border px-3 py-2.5 text-xs">
        <span className={cn(frame.question ? 'text-ink' : 'text-ink-muted')}>
          {frame.question || 'Send a message'}
        </span>
        <span className="shrink-0 font-medium text-ink">gpt-4o-mini · your key</span>
      </div>
    </div>
  );
}
