'use client';

import { Dithering } from '@paper-design/shaders-react';

import { useMotionAllowed } from '@/components/useMotionAllowed';
import { LABEL_CLASS } from '@/lib/styles';

import type { InfoVisualProps } from '@/types';

const VISUAL_SPEED = 0.35;
const DITHER_PIXEL_SIZE = 2.5;
const INK = '#000000';
const PAPER = '#ffffff';

export function InfoVisual({ caption }: InfoVisualProps) {
  const isMotionAllowed = useMotionAllowed();
  return (
    <aside
      aria-hidden="true"
      className="sticky top-16 hidden w-full max-w-[400px] justify-self-end lg:grid lg:gap-3"
    >
      <div className="aspect-[4/5] w-full overflow-hidden border border-frame">
        <Dithering
          style={{ width: '100%', height: '100%' }}
          colorBack={PAPER}
          colorFront={INK}
          shape="sphere"
          type="4x4"
          size={DITHER_PIXEL_SIZE}
          scale={1.08}
          speed={isMotionAllowed ? VISUAL_SPEED : 0}
        />
      </div>
      <p className={LABEL_CLASS}>{caption}</p>
    </aside>
  );
}
