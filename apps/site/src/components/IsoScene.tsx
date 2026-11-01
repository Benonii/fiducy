'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { IsoSceneProps } from '@/types';

const SCENE_WIDTH = 250;
const SCENE_HEIGHT = 175;

export function IsoScene({ children }: IsoSceneProps) {
  const sceneRef = useRef<SVGGElement>(null);
  const [viewBox, setViewBox] = useState(
    `${-SCENE_WIDTH / 2} ${-SCENE_HEIGHT / 2} ${SCENE_WIDTH} ${SCENE_HEIGHT}`
  );

  useLayoutEffect(() => {
    const bounds = sceneRef.current?.getBBox();
    if (!bounds) return;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    setViewBox(
      `${centerX - SCENE_WIDTH / 2} ${centerY - SCENE_HEIGHT / 2} ${SCENE_WIDTH} ${SCENE_HEIGHT}`
    );
  }, []);

  return (
    <svg
      className="h-[clamp(160px,20vh,240px)] w-full overflow-visible stroke-ink [stroke-linejoin:round] max-md:h-[170px]"
      viewBox={viewBox}
      aria-hidden="true"
    >
      <g ref={sceneRef}>{children}</g>
    </svg>
  );
}
