'use client';

import { Dithering } from '@paper-design/shaders-react';
import { useRef } from 'react';

import { readShowcaseFrame } from '@/lib/showcaseTimeline';
import { cn } from '@/lib/utils';

import { ShowcaseChat } from './ShowcaseChat';
import { ShowcaseCode } from './ShowcaseCode';
import { ShowcaseKeyPanel } from './ShowcaseKeyPanel';
import { ShowcaseSteps } from './ShowcaseSteps';
import { ShowcaseTrace } from './ShowcaseTrace';
import { useShowcaseClock } from './useShowcaseClock';

const SHADER_SPEED = 0.35;
const FACE_CLASS =
  'col-start-1 row-start-1 overflow-hidden rounded-xl border bg-white text-sm shadow-[0_24px_48px_-28px_rgba(0,0,0,0.22)] [backface-visibility:hidden]';

export function Showcase() {
  const frameRef = useRef<HTMLElement>(null);
  const clock = useShowcaseClock(frameRef);
  const frame = readShowcaseFrame(clock.elapsed);

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
        speed={clock.isRunning ? SHADER_SPEED : 0}
        scale={1.2}
      />
      <div className="relative w-full max-w-[1000px] [perspective:2000px]">
        <div
          className={cn(
            'grid transition-transform duration-700 ease-out-expo [transform-style:preserve-3d] motion-reduce:transition-none',
            frame.isFlipped && '[transform:rotateY(180deg)]'
          )}
        >
          <div className={FACE_CLASS} aria-hidden={frame.isFlipped}>
            <ShowcaseCode frame={frame} />
          </div>
          <div
            className={cn(FACE_CLASS, '[transform:rotateY(180deg)]')}
            aria-hidden={!frame.isFlipped}
          >
            <ShowcaseSteps frame={frame} />
            <div className="grid divide-dashed divide-frame max-md:divide-y md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:divide-x lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.85fr)]">
              <ShowcaseKeyPanel frame={frame} />
              <ShowcaseChat frame={frame} />
              <ShowcaseTrace frame={frame} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
