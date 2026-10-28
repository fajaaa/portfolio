import { ISLAND_CENTER, PALETTE, Vec3, VoxelLayers, VoxelPart } from './island-model';

/** One voxel: its min corner on the island grid and its palette character. */
export interface Voxel {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly char: string;
}

/**
 * Camera at rest, shared by the 3D scene and the fallback SVG so they line up: it looks at
 * `target` (island grid units) from the front right (`yaw`) and from above (`pitch`; 30° gives
 * the classic 2:1 pixel-art dimetric). `size` = grid units that fit the shorter canvas side.
 */
export const VIEW = {
  yaw: Math.PI / 4,
  pitch: Math.PI / 6,
  target: [ISLAND_CENTER[0], 5, ISLAND_CENTER[2]] as Vec3,
  size: 32,
} as const;

/** Hemisphere + sun, as three.js light intensities; the SVG shades its faces with the same. */
export const LIGHT = {
  sky: '#ffffff',
  ground: '#a08a6a',
  hemisphere: 1.7,
  sun: 1.9,
  /** Direction towards the sun (upper left, slightly to the front). */
  sunDirection: normalize([-0.3, 1, 0.6]),
} as const;

export function layerVoxels(layers: VoxelLayers, [ox, oy, oz]: Vec3 = [0, 0, 0]): Voxel[] {
  const voxels: Voxel[] = [];

  layers.forEach((rows, y) =>
    rows.forEach((row, z) => {
      for (let x = 0; x < row.length; x++) {
        const char = row[x];

        if (char !== '.' && PALETTE[char]) {
          voxels.push({ x: ox + x, y: oy + y, z: oz + z, char });
        }
      }
    }),
  );

  return voxels;
}

export function partVoxels(part: VoxelPart): Voxel[] {
  return layerVoxels(part.layers, part.at);
}

/** Drops voxels boxed in on all six sides (they can never be seen). */
export function exposedVoxels(voxels: readonly Voxel[]): Voxel[] {
  const filled = new Set(voxels.map(({ x, y, z }) => key(x, y, z)));
  const has = (x: number, y: number, z: number) => filled.has(key(x, y, z));

  return voxels.filter(
    ({ x, y, z }) =>
      !has(x + 1, y, z) ||
      !has(x - 1, y, z) ||
      !has(x, y + 1, z) ||
      !has(x, y - 1, z) ||
      !has(x, y, z + 1) ||
      !has(x, y, z - 1),
  );
}

/** A number unique to each grid cell within ±512 on every axis (cheaper than string keys). */
export function key(x: number, y: number, z: number): number {
  return ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);
}

function normalize([x, y, z]: Vec3): Vec3 {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
}
