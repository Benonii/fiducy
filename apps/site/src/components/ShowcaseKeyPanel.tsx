import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { ShowcaseFrameProps } from '@/types';

export function ShowcaseKeyPanel({ frame }: ShowcaseFrameProps) {
  const visibleKey = frame.isKeySaved ? `${'•'.repeat(12)}${frame.key.slice(-4)}` : frame.key;
  return (
    <div className="grid content-start gap-3 p-5.5">
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
          ? 'Sealed in the enclave. Acme Chat only keeps a handle.'
          : 'Acme Chat never sees your key. It is sealed in an enclave.'}
      </p>
    </div>
  );
}
