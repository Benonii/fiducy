import type { ReactNode } from 'react';

// Isometric projection for the line-art illustrations. One unit is UNIT pixels; +x runs
// down-right, +y runs down-left and +z runs straight up.
const UNIT = 16;
const COS_30 = Math.cos(Math.PI / 6);

type Point = readonly [number, number, number];

export function project([x, y, z]: Point): [number, number] {
  return [(x - y) * COS_30 * UNIT, ((x + y) * 0.5 - z) * UNIT];
}

/** Screen offset for a move along the x, y or z axis, for CSS transforms. */
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

interface BoxProps {
  at: Point;
  size: Point;
  className?: string;
  children?: ReactNode;
}

/** A box drawn as its three visible faces. Children are drawn on top, for details. */
export function Box({
  at: [x, y, z],
  size: [width, depth, height],
  className,
  children
}: BoxProps) {
  const top = z + height;
  return (
    <g className={className}>
      <polygon
        className="iso-side-left"
        points={points([
          [x, y + depth, z],
          [x + width, y + depth, z],
          [x + width, y + depth, top],
          [x, y + depth, top]
        ])}
      />
      <polygon
        className="iso-side-right"
        points={points([
          [x + width, y, z],
          [x + width, y + depth, z],
          [x + width, y + depth, top],
          [x + width, y, top]
        ])}
      />
      <polygon
        className="iso-top"
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

/** A flat outline on a horizontal plane, for slots, plates and ghosts. */
export function Plate({
  at: [x, y, z],
  size: [width, depth],
  className
}: { at: Point; size: readonly [number, number]; className?: string }) {
  return (
    <polygon
      className={className}
      points={points([
        [x, y, z],
        [x + width, y, z],
        [x + width, y + depth, z],
        [x, y + depth, z]
      ])}
    />
  );
}

/** A line on a box face, for log lines and seams. */
export function Line({ from, to, className }: { from: Point; to: Point; className?: string }) {
  const [x1, y1] = project(from);
  const [x2, y2] = project(to);
  return <line className={className} x1={x1} y1={y1} x2={x2} y2={y2} />;
}

/** A label pinned to a point in the scene. */
export function Tag({
  at,
  children,
  className
}: { at: Point; children: ReactNode; className?: string }) {
  const [x, y] = project(at);
  return (
    <text className={className ?? 'iso-tag'} x={x} y={y}>
      {children}
    </text>
  );
}
