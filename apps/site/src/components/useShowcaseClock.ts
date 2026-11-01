'use client';

import { useEffect, useState } from 'react';

import { SHOWCASE_FINAL_MILLISECONDS, SHOWCASE_LOOP_MILLISECONDS } from '@/lib/showcaseTimeline';

import type { ShowcaseClock } from '@/types';
import type { RefObject } from 'react';

const TICK_MILLISECONDS = 40;
const VISIBLE_THRESHOLD = { threshold: 0.4 };

function startClock(onTick: (elapsed: number) => void): () => void {
  const startedAt = performance.now();
  const interval = window.setInterval(() => {
    onTick((performance.now() - startedAt) % SHOWCASE_LOOP_MILLISECONDS);
  }, TICK_MILLISECONDS);
  return () => window.clearInterval(interval);
}

export function useShowcaseClock(frameRef: RefObject<HTMLElement | null>): ShowcaseClock {
  const [elapsed, setElapsed] = useState(SHOWCASE_FINAL_MILLISECONDS);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopClock: (() => void) | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      stopClock?.();
      stopClock = entry?.isIntersecting ? startClock(setElapsed) : null;
      setIsRunning(Boolean(stopClock));
    }, VISIBLE_THRESHOLD);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      stopClock?.();
    };
  }, [frameRef]);
  return { elapsed, isRunning };
}
