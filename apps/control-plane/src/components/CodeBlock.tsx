'use client';

import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsPhone } from '@/hooks/useIsPhone';

import { CopyButton } from './CopyButton';

import type { CodeBlockProps } from './types';

function Code({ code }: CodeBlockProps) {
  return (
    <pre className="min-w-0 overflow-x-auto border bg-surface p-4 text-xs leading-relaxed">
      {code}
    </pre>
  );
}

export function CodeBlock({ code }: CodeBlockProps) {
  const isPhone = useIsPhone();
  if (!isPhone) {
    return (
      <div className="grid gap-2">
        <CopyButton className="justify-self-end" label="code" value={code} />
        <Code code={code} />
      </div>
    );
  }
  return (
    <Collapsible className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <CollapsibleTrigger render={<Button className="group" size="xs" variant="link" />}>
          <ChevronDownIcon className="transition-transform group-data-panel-open:rotate-180" />
          <span className="group-data-panel-open:hidden">Show code</span>
          <span className="hidden group-data-panel-open:inline">Hide code</span>
        </CollapsibleTrigger>
        <CopyButton label="code" value={code} />
      </div>
      <CollapsiblePanel className="data-closed:hidden">
        <Code code={code} />
      </CollapsiblePanel>
    </Collapsible>
  );
}
