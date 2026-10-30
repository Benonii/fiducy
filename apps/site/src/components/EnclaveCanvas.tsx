'use client';

import { useEffect, useRef } from 'react';

import { startEnclaveRenderer } from '@/lib/enclaveRenderer';

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
    <div ref={hostRef} className="enclave-canvas">
      <canvas ref={canvasRef} />
      <span ref={handleLabelRef} className="enclave-label">
        half in your handle
      </span>
      <span ref={storedLabelRef} className="enclave-label enclave-label-quiet">
        half sealed here
      </span>
      <span ref={requestLabelRef} className="enclave-label">
        provider call
      </span>
    </div>
  );
}
