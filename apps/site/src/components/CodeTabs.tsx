'use client';

import { CodeBlock } from '@/components/CodeBlock';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { CODE_SAMPLES } from '@/lib/codeSamples';

export function CodeTabs() {
  return (
    <Tabs
      defaultValue={CODE_SAMPLES[0]?.id}
      className="gap-0 overflow-hidden rounded-xl border bg-white shadow-xs/5"
    >
      <div className="overflow-x-auto border-b border-dashed px-3 pt-2 [scrollbar-width:none]">
        <TabsList variant="underline" aria-label="Integration code">
          {CODE_SAMPLES.map((sample) => (
            <TabsTab key={sample.id} value={sample.id} className="max-md:px-2 max-md:text-[13px]">
              {sample.label}
            </TabsTab>
          ))}
        </TabsList>
      </div>
      {CODE_SAMPLES.map((sample) => (
        <TabsPanel key={sample.id} value={sample.id}>
          <p className="px-5 pt-4 max-md:px-4 font-mono text-xs text-ink-muted">{sample.file}</p>
          <pre className="animate-code-in max-h-[min(58vh,460px)] overflow-auto max-md:max-h-[44vh] px-5 pt-3 pb-6 font-mono text-[0.8125rem] leading-[1.75] text-ink-body max-md:px-4 max-md:text-[11px] max-md:whitespace-pre-wrap max-md:[overflow-wrap:anywhere] motion-reduce:animate-none">
            <CodeBlock code={sample.code} />
          </pre>
        </TabsPanel>
      ))}
    </Tabs>
  );
}
