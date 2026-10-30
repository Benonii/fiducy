import { ISO_FACES, ISO_TAG } from '@/lib/isoStyles';

import type { BoxProps, LineProps, PlateProps } from '@/types';
import type { Point, TagProps } from '@/types';

const UNIT = 16;
const COS_30 = Math.cos(Math.PI / 6);

export function project([x, y, z]: Point): [number, number] {
  return [(x - y) * COS_30 * UNIT, ((x + y) * 0.5 - z) * UNIT];
}

export function offset(x: number, y: number, z: number): string {
  const [left, top] = project([x, y, z]);
  return `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
}

function points(corners: Point[]): string {
  return corners
    .map((corner) =>
      project(corner)
        .map((value) => value.toFixed(1))
        .join(',')
    )
    .join(' ');
}

export function Box({
  at: [x, y, z],
  size: [width, depth, height],
  tone = 'line',
  children
}: BoxProps) {
  const top = z + height;
  const faces = ISO_FACES[tone];
  return (
    <g>
      <polygon
        className={faces.left}
        vectorEffect="non-scaling-stroke"
        points={points([
          [x, y + depth, z],
          [x + width, y + depth, z],
          [x + width, y + depth, top],
          [x, y + depth, top]
        ])}
      />
      <polygon
        className={faces.right}
        vectorEffect="non-scaling-stroke"
        points={points([
          [x + width, y, z],
          [x + width, y + depth, z],
          [x + width, y + depth, top],
          [x + width, y, top]
        ])}
      />
      <polygon
        className={faces.top}
        vectorEffect="non-scaling-stroke"
        points={points([
          [x, y, top],
          [x + width, y, top],
          [x + width, y + depth, top],
          [x, y + depth, top]
        ])}
      />
      {children}
    </g>
  );
}

export function Plate({ at: [x, y, z], size: [width, depth], className }: PlateProps) {
  return (
    <polygon
      className={className}
      vectorEffect="non-scaling-stroke"
      points={points([
        [x, y, z],
        [x + width, y, z],
        [x + width, y + depth, z],
        [x, y + depth, z]
      ])}
    />
  );
}

export function Line({ from, to, className }: LineProps) {
  const [x1, y1] = project(from);
  const [x2, y2] = project(to);
  return (
    <line className={className} vectorEffect="non-scaling-stroke" x1={x1} y1={y1} x2={x2} y2={y2} />
  );
}

export function Tag({ at, children, className }: TagProps) {
  const [x, y] = project(at);
  return (
    <text className={`${ISO_TAG} ${className ?? ''}`} x={x} y={y}>
      {children}
    </text>
  );
}
