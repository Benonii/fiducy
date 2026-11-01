'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { IsoSceneProps } from '@/types';

const SCENE_WIDTH = 300;
const SCENE_HEIGHT = 220;

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
      className="my-4 h-[300px] w-full overflow-visible stroke-ink [stroke-linejoin:round] max-md:my-2 max-md:h-[230px] xl:h-[340px]"
      viewBox={viewBox}
      aria-hidden="true"
    >
      <g ref={sceneRef}>{children}</g>
    </svg>
  );
}
