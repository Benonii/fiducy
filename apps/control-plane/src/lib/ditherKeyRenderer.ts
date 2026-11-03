import { WebGLRenderer } from 'three';

import { animateDitherKey, createDitherKeyParts } from '@/lib/ditherKeyScene';

import type { DitherKeyParts } from '@/lib/types';

const MAX_PIXEL_RATIO = 2;
const CELL_CSS_PIXELS = 3;
const REDUCED_MOTION_SECONDS = 2.4;

function resizeRenderer(renderer: WebGLRenderer, parts: DitherKeyParts, host: HTMLElement): void {
  const { width, height } = host.getBoundingClientRect();
  const cssWidth = Math.max(1, width);
  const cssHeight = Math.max(1, height);
  const columns = Math.ceil(cssWidth / CELL_CSS_PIXELS);
  const rows = Math.ceil(cssHeight / CELL_CSS_PIXELS);
  renderer.setSize(cssWidth, cssHeight, false);
  parts.target.setSize(columns, rows);
  parts.cells.set(columns, rows);
  parts.camera.aspect = cssWidth / cssHeight;
  parts.camera.updateProjectionMatrix();
}

export function startDitherKeyRenderer(canvas: HTMLCanvasElement, host: HTMLElement): () => void {
  const renderer = new WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  const parts = createDitherKeyParts();
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();
  let frame = 0;
  let isVisible = true;

  const render = (now: number) => {
    const elapsedSeconds = isReducedMotion ? REDUCED_MOTION_SECONDS : (now - startedAt) / 1000;
    animateDitherKey(parts, elapsedSeconds);
    renderer.setRenderTarget(parts.target);
    renderer.render(parts.scene, parts.camera);
    renderer.setRenderTarget(null);
    renderer.render(parts.quad, parts.quadCamera);
    const keepGoing = isVisible && !document.hidden && !isReducedMotion;
    frame = keepGoing ? requestAnimationFrame(render) : 0;
  };
  const resizeObserver = new ResizeObserver(() => {
    resizeRenderer(renderer, parts, host);
    if (!frame) frame = requestAnimationFrame(render);
  });
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry?.isIntersecting ?? true;
    if (isVisible && !frame) frame = requestAnimationFrame(render);
  });
  resizeObserver.observe(host);
  visibilityObserver.observe(host);
  resizeRenderer(renderer, parts, host);
  frame = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    parts.target.dispose();
    renderer.dispose();
  };
}
