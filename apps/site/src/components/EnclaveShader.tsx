'use client';

import { useMotionAllowed } from '@/components/useMotionAllowed';
import { MeshGradient } from '@paper-design/shaders-react';

import type { ShaderBoxProps } from '@/types';

const SHADER_SPEED = 0.3;
const SHADER_COLORS = ['#ffffff', '#d4d4d4', '#f2f2f2', '#bdbdbd'];

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export function EnclaveShader({ x, y, width, height, viewWidth, viewHeight }: ShaderBoxProps) {
  const isMotionAllowed = useMotionAllowed();
  return (
    <MeshGradient
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: toPercent(x, viewWidth),
        top: toPercent(y, viewHeight),
        width: toPercent(width, viewWidth),
        height: toPercent(height, viewHeight)
      }}
      colors={SHADER_COLORS}
      distortion={0.8}
      swirl={0.3}
      grainMixer={0}
      grainOverlay={0.25}
      speed={isMotionAllowed ? SHADER_SPEED : 0}
    />
  );
}
