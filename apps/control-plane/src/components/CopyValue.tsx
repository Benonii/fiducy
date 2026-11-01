'use client';

import { useMutation } from '@tanstack/react-query';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { CopyValueProps } from './types';

export function CopyValue({ value, label }: CopyValueProps) {
  const copy = useMutation({ mutationFn: () => navigator.clipboard.writeText(value) });
  return (
    <span className="inline-flex items-center gap-1">
      <code className="text-foreground text-xs">{value}</code>
      <Button
        aria-label={`Copy ${label}`}
        size="icon-xs"
        variant="ghost"
        onClick={() => copy.mutate()}
      >
        {copy.isSuccess ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </span>
  );
}
