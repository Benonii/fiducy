import type { ReactNode } from 'react';
import type { Group, LineSegments, MeshBasicMaterial } from 'three';
import type { Object3D, Scene } from 'three';

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

export interface KeyHalves {
  storedHalf: Group;
  handleHalf: Group;
  keyFaces: MeshBasicMaterial;
}

export interface EnclaveParts {
  scene: Scene;
  turntable: Group;
  attestationFrame: LineSegments;
  request: Group;
  halves: KeyHalves;
}

export interface PointerState {
  targetX: number;
  targetY: number;
  dragVelocity: number;
  isDragging: boolean;
  lastClientX: number;
}

export interface EnclaveCanvasProps {
  className?: string;
}

export interface SceneLabel {
  element: HTMLElement;
  anchor: Object3D;
}

export interface SceneLabelElements {
  handleHalf: HTMLElement;
  storedHalf: HTMLElement;
  request: HTMLElement;
}
