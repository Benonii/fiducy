import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseKeyPanel({ frame }: ShowcaseFrameProps) {
  const visibleKey = frame.isKeySaved ? `${'•'.repeat(12)}${frame.key.slice(-4)}` : frame.key;
  const isAfterKeyStep = frame.activeStep === 'ask' || frame.activeStep === 'answer';
  return (
    <div
      className={cn('grid content-start gap-3 p-5.5 max-md:p-4', isAfterKeyStep && 'max-md:hidden')}
    >
      <p className="font-semibold">Connect your OpenAI key</p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={visibleKey}
          placeholder="sk-..."
          aria-label="Example key"
          className="font-mono"
        />
        <Button tabIndex={-1} variant={frame.isKeySaved ? 'outline' : 'default'}>
          {frame.isKeySaved ? 'Saved' : 'Save key'}
        </Button>
      </div>
      <p className="text-xs font-light text-ink-muted">
        {frame.isKeySaved
          ? 'Saved. Acme Chat can use your key, but it can never read it.'
          : 'Your key stays private, even from Acme Chat.'}
      </p>
    </div>
  );
}
