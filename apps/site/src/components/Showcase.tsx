'use client';

import { Dithering } from '@paper-design/shaders-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { REQUEST_TRACE } from '@/lib/constants';

const SHADER_SPEED = 0.35;

export function Showcase() {
  const frameRef = useRef<HTMLElement>(null);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => {
      setSpeed(entry?.isIntersecting && !reducedMotion.matches ? SHADER_SPEED : 0);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={frameRef}
      className="relative grid min-h-[520px] place-items-center overflow-hidden px-gutter py-14 max-md:min-h-0 max-md:px-4 max-md:py-8"
      aria-label="Fiducy in a chat app"
    >
      <Dithering
        className="absolute inset-0"
        colorBack="#ffffff"
        colorFront="#cfcfcf"
        shape="warp"
        type="4x4"
        size={2.5}
        speed={speed}
        scale={1.2}
      />
      <div className="relative grid w-full max-w-[1000px] divide-dashed divide-frame overflow-hidden rounded-xl border bg-white text-sm shadow-[0_24px_48px_-28px_rgba(0,0,0,0.22)] max-md:divide-y md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:divide-x lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.85fr)]">
        <div className="grid content-start gap-3 p-5.5">
          <p className="font-semibold">Connect your OpenAI key</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value="••••••••••••••••••••XWYZ"
              aria-label="Example saved key"
              className="font-mono"
            />
            <Button tabIndex={-1}>Save key</Button>
          </div>
          <p className="text-xs font-light text-ink-muted">
            Acme Chat never sees your key. It is sealed in an enclave.
          </p>
        </div>
        <div className="grid min-h-[300px] content-end gap-3 p-5.5 max-md:min-h-0">
          <p className="max-w-[90%] justify-self-end rounded-lg bg-wash px-3 py-2">
            Summarize this contract in three lines.
          </p>
          <p className="max-w-[90%] leading-[1.55] text-ink-body">
            The vendor licenses the software for 12 months, renews automatically, and either side
            can end it with 30 days notice.
          </p>
          <div className="mt-2 flex justify-between gap-2 rounded-lg border px-3 py-2.5 text-xs text-ink-muted">
            <span>Send a message</span>
            <span className="font-medium text-ink">gpt-4o-mini · your key</span>
          </div>
        </div>
        <ol className="hidden content-start divide-y divide-dashed divide-frame px-5.5 text-xs lg:grid">
          {REQUEST_TRACE.map((entry) => (
            <li key={entry.step} className="grid gap-0.5 py-2.5">
              <span className="font-semibold">{entry.step}</span>
              <span className="font-mono text-[11px] text-ink-muted">{entry.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
