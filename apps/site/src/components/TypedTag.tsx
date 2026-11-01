'use client';

import { useEffect, useRef } from 'react';

import { project } from '@/components/isometric';
import { ISO_TAG, LEAK_LOOP_MILLISECONDS } from '@/lib/isoStyles';

import type { TypedTagProps } from '@/types';

const PROMPT = '$ ';
const CURSOR = '█';
const CHARACTER_MILLISECONDS = 45;
const BLINK_MILLISECONDS = 500;

function readTyped(text: string, startsAt: number, element: SVGTextElement): string {
  const animationTime = Number(element.getAnimations()[0]?.currentTime ?? 0);
  const elapsed = (animationTime % LEAK_LOOP_MILLISECONDS) - startsAt;
  const typedCount = Math.max(0, Math.floor(elapsed / CHARACTER_MILLISECONDS));
  const isTyping = typedCount < text.length;
  const isCursorOn = isTyping || Math.floor(elapsed / BLINK_MILLISECONDS) % 2 === 0;
  return `${PROMPT}${text.slice(0, typedCount)}${isCursorOn ? CURSOR : ''}`;
}

export function TypedTag({ at, text, startsAt, className }: TypedTagProps) {
  const textRef = useRef<SVGTextElement>(null);
  const [x, y] = project(at);

  useEffect(() => {
    const element = textRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const draw = () => {
      element.textContent = readTyped(text, startsAt, element);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [text, startsAt]);

  return (
    <text ref={textRef} className={`${ISO_TAG} ${className}`} x={x} y={y}>
      {`${PROMPT}${text}`}
    </text>
  );
}
