'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotionAllowed } from '@/components/useMotionAllowed';
import {
  CIPHER_FRAME_MILLISECONDS,
  CIPHER_SETTLED_EVERY,
  CIPHER_TOUCH_HOLD_MILLISECONDS,
  encipher,
  moveToward,
  pixelFilterID
} from '@/lib/cipher';

import type { CipherWordProps } from '@/types';
import type { PointerEvent } from 'react';

export function CipherWord({ word, isHinted }: CipherWordProps) {
  const isMotionAllowed = useMotionAllowed();
  const [isHeld, setIsHeld] = useState(false);
  const [progress, setProgress] = useState(0);
  const [glyphs, setGlyphs] = useState(word);
  const progressRef = useRef(0);
  const releaseRef = useRef(0);
  const isSealed = isHeld || isHinted;

  useEffect(() => {
    if (!isMotionAllowed) {
      progressRef.current = isSealed ? 1 : 0;
      setProgress(progressRef.current);
      setGlyphs(encipher(word, progressRef.current));
      return;
    }
    let tick = 0;
    const timer = window.setInterval(() => {
      tick += 1;
      const isSettled = progressRef.current === 1 && isSealed;
      if (isSettled && tick % CIPHER_SETTLED_EVERY !== 0) return;
      progressRef.current = moveToward(progressRef.current, isSealed);
      setProgress(progressRef.current);
      setGlyphs(encipher(word, progressRef.current));
      if (!isSealed && progressRef.current === 0) window.clearInterval(timer);
    }, CIPHER_FRAME_MILLISECONDS);
    return () => window.clearInterval(timer);
  }, [isSealed, isMotionAllowed, word]);

  useEffect(() => () => window.clearTimeout(releaseRef.current), []);

  function hover(event: PointerEvent, isEntering: boolean) {
    if (event.pointerType === 'mouse') setIsHeld(isEntering);
  }

  function tap(event: PointerEvent) {
    if (event.pointerType === 'mouse') return;
    setIsHeld(true);
    window.clearTimeout(releaseRef.current);
    releaseRef.current = window.setTimeout(() => setIsHeld(false), CIPHER_TOUCH_HOLD_MILLISECONDS);
  }

  const isVisible = progress > 0;

  return (
    <span
      className="relative inline-block cursor-crosshair touch-manipulation"
      onPointerEnter={(event) => hover(event, true)}
      onPointerLeave={(event) => hover(event, false)}
      onPointerDown={tap}
    >
      <span className={isVisible ? 'text-transparent' : undefined}>{word}</span>
      {isVisible ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden tracking-[-0.1em] whitespace-nowrap select-none"
          style={{ filter: `url(#${pixelFilterID(progress)})` }}
        >
          {glyphs}
        </span>
      ) : null}
    </span>
  );
}
