import { CHARACTER, CLOUDS, PALETTE, SCENERY, Vec3, WATERFALL } from './island-model';
import { LIGHT, VIEW, Voxel, exposedVoxels, key, layerVoxels, partVoxels } from './voxels';

export interface IslandSprite {
  readonly size: number;
  /** One path per colour; each horizontal pixel run is a 1px-wide stroke. */
  readonly paths: readonly { readonly color: string; readonly d: string }[];
}

/** Sprite pixels per island grid unit (the 3D scene ends up at a similar density). */
const PIXELS_PER_UNIT = 5;

/** The three cube faces the camera sees: top, right (+x) and left (+z), with their corners. */
const FACES: readonly { readonly normal: Vec3; readonly corners: readonly Vec3[] }[] = [
  { normal: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
  { normal: [1, 0, 0], corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { normal: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
];

/**
 * The island at rest as a pixel-art SVG, seen through the same camera and light as the 3D scene:
 * the WebGL placeholder and the fallback when WebGL isn't available. Painter's algorithm on a
 * small pixel grid, then one path per colour.
 */
export function createIslandSprite(): IslandSprite {
  const voxels = sceneVoxels();
  const size = Math.round(VIEW.size * PIXELS_PER_UNIT);
  const pixels = new Array<string | undefined>(size * size).fill(undefined);
  const filled = new Set(voxels.map(({ x, y, z }) => key(x, y, z)));
  const camera = cameraBasis(size);
  // The projection is linear, so a face's corners sit at fixed pixel offsets from its voxel.
  const faceOffsets = FACES.map(({ corners }) => corners.flatMap((corner) => camera.offset(corner)));
  const shades = new Map<string, string[]>();
  const quad = new Float64Array(8);

  const sorted = exposedVoxels(voxels)
    .map((voxel) => ({ voxel, depth: dot([voxel.x, voxel.y, voxel.z], camera.back) }))
    .sort((a, b) => a.depth - b.depth);

  for (const { voxel } of sorted) {
    const { x, y, z, char } = voxel;
    const [originX, originY] = camera.project([x, y, z]);
    let colors = shades.get(char);

    if (!colors) {
      colors = FACES.map(({ normal }) => shade(PALETTE[char], normal));
      shades.set(char, colors);
    }

    for (let f = 0; f < FACES.length; f++) {
      const [nx, ny, nz] = FACES[f].normal;

      if (filled.has(key(x + nx, y + ny, z + nz))) {
        continue;
      }

      const offsets = faceOffsets[f];
      for (let i = 0; i < 8; i += 2) {
        quad[i] = originX + offsets[i];
        quad[i + 1] = originY + offsets[i + 1];
      }

      fillQuad(pixels, size, quad, colors[f]);
    }
  }

  return { size, paths: toPaths(pixels, size) };
}

function sceneVoxels(): Voxel[] {
  const voxels = [...Object.values(SCENERY), ...Object.values(CHARACTER)].flatMap(partVoxels);
  const [wx, wy, wz] = WATERFALL.at;

  for (let i = 0; i < WATERFALL.length; i++) {
    for (let x = 0; x < WATERFALL.width; x++) {
      for (let z = 0; z < WATERFALL.depth; z++) {
        voxels.push({ x: wx + x, y: wy - i, z: wz + z, char: WATERFALL.colors[i % WATERFALL.colors.length] });
      }
    }
  }

  for (const cloud of CLOUDS) {
    voxels.push(...layerVoxels(cloud.layers, cloud.at));
  }

  return voxels;
}

function cameraBasis(size: number) {
  const { yaw, pitch, target } = VIEW;
  const back: Vec3 = [Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw)];
  const right: Vec3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const up: Vec3 = [-Math.sin(pitch) * Math.sin(yaw), Math.cos(pitch), -Math.sin(pitch) * Math.cos(yaw)];
  /** Grid vector → sprite pixel offset (y down). */
  const offset = (vector: Vec3): [number, number] => [
    dot(vector, right) * PIXELS_PER_UNIT,
    -dot(vector, up) * PIXELS_PER_UNIT,
  ];

  return {
    back,
    offset,
    /** Grid point → sprite pixel coordinates, with the target in the middle. */
    project([x, y, z]: Vec3): [number, number] {
      const [dx, dy] = offset([x - target[0], y - target[1], z - target[2]]);
      return [size / 2 + dx, size / 2 + dy];
    },
  };
}

// Edge equations of the quad being filled (a·x + b·y + c ≥ 0 inside), reused between calls.
const edges = new Float64Array(12);

/** Fills the pixels whose centres lie inside the convex quad (x0, y0, x1, y1, …). */
function fillQuad(pixels: (string | undefined)[], size: number, quad: Float64Array, color: string): void {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let area = 0;

  for (let i = 0; i < 4; i++) {
    const ax = quad[i * 2];
    const ay = quad[i * 2 + 1];
    const bx = quad[((i + 1) % 4) * 2];
    const by = quad[((i + 1) % 4) * 2 + 1];

    minX = Math.min(minX, ax);
    maxX = Math.max(maxX, ax);
    minY = Math.min(minY, ay);
    maxY = Math.max(maxY, ay);
    area += ax * by - bx * ay;
    edges[i * 3] = ay - by;
    edges[i * 3 + 1] = bx - ax;
    edges[i * 3 + 2] = ax * by - bx * ay;
  }

  // Flip the equations for quads wound the other way round.
  const sign = area < 0 ? -1 : 1;
  const x0 = Math.max(Math.floor(minX), 0);
  const x1 = Math.min(Math.ceil(maxX), size - 1);
  const y0 = Math.max(Math.floor(minY), 0);
  const y1 = Math.min(Math.ceil(maxY), size - 1);

  for (let py = y0; py <= y1; py++) {
    const y = py + 0.5;

    for (let px = x0; px <= x1; px++) {
      const x = px + 0.5;
      let inside = true;

      for (let e = 0; e < 12 && inside; e += 3) {
        inside = sign * (edges[e] * x + edges[e + 1] * y + edges[e + 2]) >= 0;
      }

      if (inside) {
        pixels[py * size + px] = color;
      }
    }
  }
}

function toPaths(pixels: (string | undefined)[], size: number): IslandSprite['paths'] {
  const paths = new Map<string, string>();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; ) {
      const color = pixels[y * size + x];
      let run = 1;

      while (x + run < size && pixels[y * size + x + run] === color) {
        run++;
      }

      if (color) {
        paths.set(color, `${paths.get(color) ?? ''}M${x} ${y + 0.5}h${run}`);
      }

      x += run;
    }
  }

  return Array.from(paths, ([color, d]) => ({ color, d }));
}

/** Lambert shading as three.js does it (hemisphere + directional light, linear colour space). */
function shade(hex: string, normal: Vec3): string {
  const albedo = hexToLinear(hex);
  const sky = hexToLinear(LIGHT.sky);
  const ground = hexToLinear(LIGHT.ground);
  const skyWeight = normal[1] * 0.5 + 0.5;
  const sun = Math.max(dot(normal, LIGHT.sunDirection), 0) * LIGHT.sun;

  const channels = albedo.map((value, i) => {
    const hemisphere = (ground[i] + (sky[i] - ground[i]) * skyWeight) * LIGHT.hemisphere;
    return linearToSrgb(Math.min((value * (hemisphere + sun)) / Math.PI, 1));
  });

  return `#${channels.map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToLinear(hex: string): number[] {
  return [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c < 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}

function linearToSrgb(c: number): number {
  return c < 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
