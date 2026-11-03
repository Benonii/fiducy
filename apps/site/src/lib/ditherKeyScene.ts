import { AmbientLight, Color, DirectionalLight, EdgesGeometry, Group, LineSegments } from 'three';
import { Mesh, MeshLambertMaterial, OrthographicCamera, PerspectiveCamera } from 'three';
import {
  NearestFilter,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget
} from 'three';

import {
  createHandleHalfGeometry,
  createStoredHalfGeometry,
  inkLines
} from '@/lib/enclaveGeometry';

import type { DitherKeyParts } from '@/types';
import type { BufferGeometry } from 'three';

const PAPER = 0xffffff;
const KEY_GRAY = 0xdcdcdc;
const EDGE_ANGLE = 20;
const AMBIENT = 0.3;
const SUN = 1.6;
const CAMERA_DISTANCE = 8.4;
const TURN_SECONDS = 14;
const SPLIT_SECONDS = 7;
const SPLIT_GAP = 0.8;
const LEAN = 0.35;
const KEY_CENTER_X = 0.18;

const DITHER_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const DITHER_FRAGMENT = `
uniform sampler2D map;
uniform vec2 cells;
varying vec2 vUv;
const mat4 bayer = mat4(
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);
void main() {
  vec2 cell = floor(vUv * cells);
  vec3 color = texture2D(map, (cell + 0.5) / cells).rgb;
  float light = dot(color, vec3(0.299, 0.587, 0.114));
  int column = int(mod(cell.x, 4.0));
  int row = int(mod(cell.y, 4.0));
  float threshold = (bayer[column][row] + 0.5) / 16.0;
  float ink = light > threshold ? 1.0 : 0.0;
  gl_FragColor = vec4(vec3(ink), 1.0);
}`;

function createShadedPart(geometry: BufferGeometry): Group {
  const part = new Group();
  part.add(new Mesh(geometry, new MeshLambertMaterial({ color: KEY_GRAY })));
  part.add(new LineSegments(new EdgesGeometry(geometry, EDGE_ANGLE), inkLines));
  return part;
}

export function createDitherKeyParts(): DitherKeyParts {
  const scene = new Scene();
  scene.background = new Color(PAPER);
  const turntable = new Group();
  const key = new Group();
  const handleHalf = createShadedPart(createHandleHalfGeometry());
  const storedHalf = createShadedPart(createStoredHalfGeometry());
  const centered = new Group();
  centered.add(handleHalf, storedHalf);
  centered.position.x = KEY_CENTER_X;
  key.add(centered);
  key.rotation.z = -Math.PI / 3;
  turntable.add(key);
  turntable.rotation.x = LEAN;
  const sun = new DirectionalLight(PAPER, SUN);
  sun.position.set(2, 3, 4);
  scene.add(turntable, sun, new AmbientLight(PAPER, AMBIENT));
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_DISTANCE);
  const target = new WebGLRenderTarget(1, 1, {
    minFilter: NearestFilter,
    magFilter: NearestFilter
  });
  const cells = new Vector2(1, 1);
  const material = new ShaderMaterial({
    uniforms: { map: { value: target.texture }, cells: { value: cells } },
    vertexShader: DITHER_VERTEX,
    fragmentShader: DITHER_FRAGMENT,
    depthTest: false
  });
  const quad = new Scene();
  quad.add(new Mesh(new PlaneGeometry(2, 2), material));
  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { scene, camera, turntable, handleHalf, storedHalf, target, cells, quad, quadCamera };
}

export function animateDitherKey(parts: DitherKeyParts, elapsedSeconds: number): void {
  const turn = (elapsedSeconds / TURN_SECONDS) * Math.PI * 2;
  const split = (1 - Math.cos((elapsedSeconds / SPLIT_SECONDS) * Math.PI * 2)) / 2;
  const gap = SPLIT_GAP * split * split * (3 - 2 * split);
  parts.turntable.rotation.y = turn;
  parts.handleHalf.position.x = -gap / 2;
  parts.storedHalf.position.x = gap / 2;
}
