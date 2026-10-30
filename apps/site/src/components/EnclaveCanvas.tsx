'use client';

import { useEffect, useRef } from 'react';

import { startEnclaveRenderer } from '@/lib/enclaveRenderer';

const LABEL_CLASS =
  'pointer-events-none absolute top-0 left-0 rounded-sm bg-white/85 px-1.5 py-0.5 font-mono text-[0.625rem] whitespace-nowrap transition-opacity duration-300';

export function EnclaveCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleLabelRef = useRef<HTMLSpanElement>(null);
  const storedLabelRef = useRef<HTMLSpanElement>(null);
  const requestLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const handleHalf = handleLabelRef.current;
    const storedHalf = storedLabelRef.current;
    const request = requestLabelRef.current;
    if (!host || !canvas || !handleHalf || !storedHalf || !request) return;
    return startEnclaveRenderer(canvas, host, { handleHalf, storedHalf, request });
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="block size-full touch-pan-y" />
      <span ref={handleLabelRef} className={`${LABEL_CLASS} -translate-x-1/2 -translate-y-full`}>
        half in your handle
      </span>
      <span ref={storedLabelRef} className={`${LABEL_CLASS} -translate-x-1/2 text-ink-muted`}>
        half sealed here
      </span>
      <span ref={requestLabelRef} className={`${LABEL_CLASS} -translate-x-1/2 -translate-y-full`}>
        provider call
      </span>
    </div>
  );
}
