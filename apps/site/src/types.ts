import type { ReactNode } from 'react';

export type Point = readonly [number, number, number];

export interface BoxProps {
  at: Point;
  size: Point;
  className?: string;
  children?: ReactNode;
}

export interface PlateProps {
  at: Point;
  size: readonly [number, number];
  className?: string;
}

export interface LineProps {
  from: Point;
  to: Point;
  className?: string;
}

export interface TagProps {
  at: Point;
  children: ReactNode;
  className?: string;
}

export interface IsoSceneProps {
  children: ReactNode;
}

export interface LeakScene {
  label: string;
  hint: string;
  stat: string;
  title: string;
  quiet: string;
  description: string;
  scene: ReactNode;
}
