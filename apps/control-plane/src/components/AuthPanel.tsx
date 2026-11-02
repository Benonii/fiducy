'use client';

import { useEffect, useRef } from 'react';

import { Wordmark } from '@/components/Wordmark';
import { startDitherKeyRenderer } from '@/lib/ditherKeyRenderer';

import type { AuthPanelProps } from './types';

const PANEL_FACTS = [
  ['plaintext keys stored', '0'],
  ['key halves on this side', '1 of 2'],
  ['enclave', 'attested per request']
] as const;

export function AuthPanel({ mode }: AuthPanelProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSignUp = mode === 'sign-up';

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    return startDitherKeyRenderer(canvas, host);
  }, []);

  return (
    <section className="relative overflow-hidden bg-foreground text-background max-lg:h-44 lg:sticky lg:top-0 lg:h-dvh">
      <div
        ref={hostRef}
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 lg:inset-x-0 lg:top-0 lg:bottom-1/3 lg:w-full"
      >
        <canvas ref={canvasRef} className="block size-full" />
      </div>
      <div className="relative flex h-full flex-col justify-between p-5 lg:p-10">
        <Wordmark />
        <div className="grid gap-3 lg:gap-5">
          <h2 className="max-w-[14ch] text-balance font-semibold text-xl tracking-tight max-lg:max-w-[50%] lg:max-w-[16ch] lg:text-4xl">
            {isSignUp
              ? 'Users bring keys. You never hold them.'
              : 'Nothing to leak while you were away.'}
          </h2>
          <dl className="grid gap-1.5 font-mono text-[0.6875rem] text-background/72 uppercase tracking-[0.06em] max-lg:hidden">
            {PANEL_FACTS.map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt>{label}</dt>
                <dd className="text-background">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
