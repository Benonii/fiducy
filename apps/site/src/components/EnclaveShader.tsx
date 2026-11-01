'use client';

import { Dithering } from '@paper-design/shaders-react';
import { useEffect, useState } from 'react';

import type { ShaderBoxProps } from '@/types';

const SHADER_SPEED = 0.4;

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function useMotionAllowed() {
  const [isAllowed, setIsAllowed] = useState(false);
  useEffect(() => {
    setIsAllowed(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return isAllowed;
}

export function EnclaveShader({ x, y, width, height, viewWidth, viewHeight }: ShaderBoxProps) {
  const isMotionAllowed = useMotionAllowed();
  return (
    <Dithering
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: toPercent(x, viewWidth),
        top: toPercent(y, viewHeight),
        width: toPercent(width, viewWidth),
        height: toPercent(height, viewHeight)
      }}
      colorBack="#ffffff"
      colorFront="#dcdcdc"
      shape="warp"
      type="4x4"
      size={2}
      speed={isMotionAllowed ? SHADER_SPEED : 0}
      scale={0.8}
    />
  );
}
