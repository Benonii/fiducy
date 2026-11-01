import { CodeBlock } from '@/components/CodeBlock';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseCode({ frame }: ShowcaseFrameProps) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-4 p-5.5 max-md:p-4">
      <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
        <span className="font-mono">src/lib/fiducy.ts</span>
        <span className="max-sm:hidden">One instance, server side</span>
      </div>
      <pre className="min-h-[13.6em] self-center overflow-x-auto font-mono text-[14px] md:pl-8 leading-[1.7] whitespace-pre text-ink-body max-md:text-[11px] max-md:whitespace-pre-wrap">
        <CodeBlock code={frame.code} />
        <span
          aria-hidden="true"
          className={`ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-ink ${frame.isCodeTyping ? '' : 'animate-blink'}`}
        />
      </pre>
    </div>
  );
}
