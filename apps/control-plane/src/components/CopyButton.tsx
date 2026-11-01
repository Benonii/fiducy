'use client';

import { useMutation } from '@tanstack/react-query';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { CopyButtonProps } from './types';

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const copy = useMutation({ mutationFn: () => navigator.clipboard.writeText(value) });
  return (
    <Button
      aria-label={`Copy ${label}`}
      className={className}
      size="xs"
      variant="outline"
      onClick={() => copy.mutate()}
    >
      {copy.isSuccess ? <CheckIcon /> : <CopyIcon />}
      {copy.isSuccess ? 'Copied' : 'Copy'}
    </Button>
  );
}
