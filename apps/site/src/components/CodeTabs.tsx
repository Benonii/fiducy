'use client';

import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { CODE_SAMPLES } from '@/lib/codeSamples';

export function CodeTabs() {
  return (
    <Tabs
      defaultValue={CODE_SAMPLES[0]?.id}
      className="gap-0 overflow-hidden rounded-xl border bg-white shadow-xs/5"
    >
      <div className="border-b border-dashed px-3 pt-2">
        <TabsList variant="underline" aria-label="Integration code">
          {CODE_SAMPLES.map((sample) => (
            <TabsTab key={sample.id} value={sample.id}>
              {sample.label}
            </TabsTab>
          ))}
        </TabsList>
      </div>
      {CODE_SAMPLES.map((sample) => (
        <TabsPanel key={sample.id} value={sample.id}>
          <p className="px-5 pt-4 font-mono text-xs text-ink-muted">{sample.file}</p>
          <pre className="animate-code-in overflow-x-auto px-5 pt-3 pb-6 font-mono text-[0.8125rem] leading-[1.75] text-ink-body motion-reduce:animate-none">
            <code>{sample.code}</code>
          </pre>
        </TabsPanel>
      ))}
    </Tabs>
  );
}
