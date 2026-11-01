'use client';

import { useEffect, useState } from 'react';

import { SHOWCASE_FINAL_MILLISECONDS, SHOWCASE_LOOP_MILLISECONDS } from '@/lib/showcaseTimeline';

import type { ShowcaseClock } from '@/types';
import type { RefObject } from 'react';

const TICK_MILLISECONDS = 40;
const START_RATIO = 0.5;
const OBSERVER_OPTIONS = { threshold: [0, START_RATIO] };

function startClock(onTick: (elapsed: number) => void): () => void {
  const startedAt = performance.now();
  const interval = window.setInterval(() => {
    onTick((performance.now() - startedAt) % SHOWCASE_LOOP_MILLISECONDS);
  }, TICK_MILLISECONDS);
  return () => window.clearInterval(interval);
}

function watchFrame(
  frame: HTMLElement,
  onElapsed: (elapsed: number) => void,
  onRunning: (isRunning: boolean) => void
): () => void {
  let stopClock: (() => void) | null = null;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) {
      stopClock?.();
      stopClock = null;
      onElapsed(0);
    } else if (!stopClock && entry.intersectionRatio >= START_RATIO) {
      stopClock = startClock(onElapsed);
    }
    onRunning(Boolean(stopClock));
  }, OBSERVER_OPTIONS);
  observer.observe(frame);
  return () => {
    observer.disconnect();
    stopClock?.();
  };
}

export function useShowcaseClock(frameRef: RefObject<HTMLElement | null>): ShowcaseClock {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setElapsed(SHOWCASE_FINAL_MILLISECONDS);
      return;
    }
    return watchFrame(frame, setElapsed, setIsRunning);
  }, [frameRef]);
  return { elapsed, isRunning };
}
