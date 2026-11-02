'use client';

import { useEffect, useRef } from 'react';

import { startDitherKeyRenderer } from '@/lib/ditherKeyRenderer';
import { LABEL_CLASS } from '@/lib/styles';

import type { InfoVisualProps } from '@/types';

export function InfoVisual({ caption }: InfoVisualProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    return startDitherKeyRenderer(canvas, host);
  }, []);

  return (
    <aside
      aria-hidden="true"
      className="sticky top-16 hidden w-full max-w-[400px] justify-self-end lg:grid lg:gap-3"
    >
      <div ref={hostRef} className="aspect-[4/5] w-full overflow-hidden border border-frame">
        <canvas ref={canvasRef} className="block size-full" />
      </div>
      <p className={LABEL_CLASS}>{caption}</p>
    </aside>
  );
}
