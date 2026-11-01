import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseCode({ frame }: ShowcaseFrameProps) {
  return (
    <div className="grid content-start gap-4 p-5.5">
      <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
        <span className="font-mono">src/app/chat.tsx</span>
        <span>The SDK, in your app</span>
      </div>
      <pre className="min-h-[220px] overflow-x-auto font-mono text-[12.5px] leading-[1.7] whitespace-pre text-ink-body max-md:text-[11px] max-md:break-all max-md:whitespace-pre-wrap">
        {frame.code}
        <span
          aria-hidden="true"
          className={`ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-ink ${frame.isCodeTyping ? '' : 'animate-blink'}`}
        />
      </pre>
    </div>
  );
}
