'use client';

import { useEffect, useState } from 'react';

import { CipherWord } from '@/components/CipherWord';
import { useMotionAllowed } from '@/components/useMotionAllowed';
import { CIPHER_PIXEL_SIZES } from '@/lib/cipher';

const SEALED_WORDS = ['You', 'never', 'hold', 'them.'];
const HINT_DELAY_MILLISECONDS = 1100;
const HINT_STAGGER_MILLISECONDS = 160;
const HINT_HOLD_MILLISECONDS = 900;

function PixelFilters() {
  return (
    <svg aria-hidden="true" className="absolute size-0">
      <defs>
        {CIPHER_PIXEL_SIZES.map((size, level) => (
          <filter key={size} id={`cipher-pixel-${level}`} x="0" y="0" width="1" height="1">
            <feFlood x={size / 2} y={size / 2} width="1" height="1" />
            <feComposite width={size} height={size} />
            <feTile result="grid" />
            <feComposite in="SourceGraphic" in2="grid" operator="in" />
            <feMorphology operator="dilate" radius={size / 2} />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

export function HeroHeadline() {
  const isMotionAllowed = useMotionAllowed();
  const [hinted, setHinted] = useState<number[]>([]);

  useEffect(() => {
    if (!isMotionAllowed) return;
    const timers = SEALED_WORDS.flatMap((_, index) => {
      const sealsAt = HINT_DELAY_MILLISECONDS + index * HINT_STAGGER_MILLISECONDS;
      return [
        window.setTimeout(() => setHinted((current) => [...current, index]), sealsAt),
        window.setTimeout(
          () => setHinted((current) => current.filter((item) => item !== index)),
          sealsAt + HINT_HOLD_MILLISECONDS
        )
      ];
    });
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [isMotionAllowed]);

  return (
    <h1 className="grid gap-[0.08em] text-[clamp(2.125rem,4.6vw,4rem)] leading-none font-bold tracking-[-0.05em] text-balance">
      <PixelFilters />
      <span className="animate-rise-in text-ink">Users bring keys.</span>
      <span className="-ml-[0.12em] animate-rise-in [animation-delay:120ms]">
        <span className="bg-ink px-[0.12em] text-white box-decoration-clone">
          {SEALED_WORDS.map((word, index) => (
            <span key={word}>
              {index > 0 ? ' ' : null}
              <CipherWord word={word} isHinted={hinted.includes(index)} />
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
