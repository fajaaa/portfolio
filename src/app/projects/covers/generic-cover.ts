import type { PixelSprite } from '../../ui/pixel-art/pixel-art.component';

export const COVER_WIDTH = 32;
export const COVER_HEIGHT = 24;

/** First row of the ground strip; everything above it is sky, hills and the sprite. */
const GROUND_Y = 20;
const SPRITE_SIZE = 8;
const SPRITE_SCALE = 2;
const SPRITE_X = (COVER_WIDTH - SPRITE_SIZE * SPRITE_SCALE) / 2;
const SPRITE_Y = 3;

interface Scenery {
  sky: string;
  sparkle: string;
  hill: string;
  groundTop: string;
  ground: string;
  /** Sprite colors that stand out against this sky. */
  sprites: readonly string[];
}

/** One scenery per world palette from the brief. */
const SCENERIES: readonly Scenery[] = [
  {
    sky: 'var(--w11-sky)',
    sparkle: 'var(--w11-cloud)',
    hill: 'var(--w11-grass-dark)',
    groundTop: 'var(--w11-grass)',
    ground: 'var(--w11-dirt)',
    sprites: ['var(--hp)', 'var(--coin)', 'var(--paper)'],
  },
  {
    sky: 'var(--w12-bg)',
    sparkle: 'var(--w12-leaves)',
    hill: 'var(--w12-mid)',
    groundTop: 'var(--w12-leaves)',
    ground: 'var(--w12-trunk)',
    sprites: ['var(--coin)', 'var(--hp)', 'var(--w13-crystal-pink)'],
  },
  {
    sky: 'var(--w13-bg)',
    sparkle: 'var(--w13-crystal-cyan)',
    hill: 'var(--w13-bricks)',
    groundTop: 'var(--w13-crystal-pink)',
    ground: 'var(--w13-bricks)',
    sprites: ['var(--w13-crystal-cyan)', 'var(--w13-crystal-pink)', 'var(--xp)', 'var(--coin)'],
  },
  {
    sky: 'var(--w14-bg)',
    sparkle: 'var(--w14-bubbles)',
    hill: 'var(--w14-deep)',
    groundTop: 'var(--w14-sand)',
    ground: 'var(--w11-dirt)',
    sprites: ['var(--coin)', 'var(--hp)', 'var(--w13-crystal-pink)'],
  },
  {
    sky: 'var(--w15-bg)',
    sparkle: 'var(--w15-stars)',
    hill: 'var(--w15-stone)',
    groundTop: 'var(--w15-torch)',
    ground: 'var(--w15-stone)',
    sprites: ['var(--w15-torch)', 'var(--coin)', 'var(--xp)', 'var(--w13-crystal-cyan)'],
  },
];

const cache = new Map<string, PixelSprite>();

/**
 * A generated cover for repositories without a hand-made one: a symmetric 8x8 "space invader"
 * (drawn at 2x) in front of a pixel landscape. Everything is seeded by the repository name, so a
 * repository always gets the same cover and different repositories (almost always) differ.
 */
export function genericCover(name: string): PixelSprite {
  const cached = cache.get(name);

  if (cached) {
    return cached;
  }

  const random = mulberry32(hashString(name));
  const scenery = pick(SCENERIES, random);
  const grid = Array.from({ length: COVER_HEIGHT }, () => Array<string>(COVER_WIDTH).fill('s'));

  drawSparkles(grid, random);
  drawHills(grid, random);
  drawGround(grid, random);
  drawInvader(grid, random);

  const cover: PixelSprite = {
    rows: grid.map((row) => row.join('')),
    palette: {
      s: scenery.sky,
      t: scenery.sparkle,
      h: scenery.hill,
      g: scenery.groundTop,
      d: scenery.ground,
      x: pick(scenery.sprites, random),
      o: 'var(--ink)',
    },
  };

  cache.set(name, cover);
  return cover;
}

/** 32-bit FNV-1a hash. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/** Small seeded PRNG returning floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

function int(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function drawSparkles(grid: string[][], random: () => number): void {
  const count = int(6, 10, random);

  for (let i = 0; i < count; i++) {
    grid[int(0, 12, random)][int(0, COVER_WIDTH - 1, random)] = 't';
  }
}

/** Rolling hills: a random walk of heights above the ground, changing by at most 1 per column. */
function drawHills(grid: string[][], random: () => number): void {
  let height = int(3, 7, random);

  for (let x = 0; x < COVER_WIDTH; x++) {
    // Flat runs of 2+ columns read as pixel hills; single-pixel spikes look like noise.
    if (x % 2 === 0) {
      height = Math.min(9, Math.max(2, height + int(-1, 1, random)));
    }

    for (let y = GROUND_Y - height; y < GROUND_Y; y++) {
      grid[y][x] = 'h';
    }
  }
}

function drawGround(grid: string[][], random: () => number): void {
  for (let y = GROUND_Y; y < COVER_HEIGHT; y++) {
    for (let x = 0; x < COVER_WIDTH; x++) {
      grid[y][x] = y === GROUND_Y || random() < 0.08 ? 'g' : 'd';
    }
  }
}

function drawInvader(grid: string[][], random: () => number): void {
  const half = SPRITE_SIZE / 2;
  const cells = Array.from({ length: SPRITE_SIZE }, () => Array<boolean>(half).fill(false));

  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < half; x++) {
      cells[y][x] = random() < 0.5;
    }
  }

  // A solid core with eye sockets around it, so every sprite reads as a creature.
  for (let y = 2; y <= 5; y++) {
    cells[y][half - 1] = true;
  }
  cells[2][2] = cells[3][2] = cells[4][2] = cells[3][1] = true;

  const isEye = (x: number, y: number): boolean => y === 3 && (x === 2 || x === SPRITE_SIZE - 3);
  const sprite = new Set<string>();

  // Mirror the left half and draw each cell as a SPRITE_SCALE-sized block.
  for (let y = 0; y < SPRITE_SIZE; y++) {
    for (let x = 0; x < SPRITE_SIZE; x++) {
      if (!cells[y][x < half ? x : SPRITE_SIZE - 1 - x]) {
        continue;
      }

      for (let dy = 0; dy < SPRITE_SCALE; dy++) {
        for (let dx = 0; dx < SPRITE_SCALE; dx++) {
          const px = SPRITE_X + x * SPRITE_SCALE + dx;
          const py = SPRITE_Y + y * SPRITE_SCALE + dy;
          grid[py][px] = isEye(x, y) ? 'o' : 'x';
          sprite.add(`${px},${py}`);
        }
      }
    }
  }

  // 1px ink outline around (and inside the gaps of) the sprite.
  const inSprite = (x: number, y: number) => sprite.has(`${x},${y}`);

  for (let y = SPRITE_Y - 1; y <= SPRITE_Y + SPRITE_SIZE * SPRITE_SCALE; y++) {
    for (let x = SPRITE_X - 1; x <= SPRITE_X + SPRITE_SIZE * SPRITE_SCALE; x++) {
      if (
        !inSprite(x, y) &&
        (inSprite(x - 1, y) || inSprite(x + 1, y) || inSprite(x, y - 1) || inSprite(x, y + 1))
      ) {
        grid[y][x] = 'o';
      }
    }
  }
}
