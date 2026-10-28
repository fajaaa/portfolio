/*
 * The hero's voxel island, as hand-editable layer maps. Plain data: no three.js, no Angular.
 *
 * HOW TO EDIT
 * - A part is a stack of layers, BOTTOM layer first. Each layer is a list of rows from the BACK of
 *   the island to the FRONT (front = towards the viewer's lower left), and each row is read LEFT to
 *   RIGHT (right = towards the viewer's lower right). One character = one voxel, '.' = empty.
 * - Characters map to colours in PALETTE. Add a letter there to get a new colour.
 * - `at` is where the part's first character (bottom layer, back row, left column) sits on the
 *   island grid as [x (left → right), y (up), z (back → front)]. The grass top is at y = 6, so
 *   things standing on the grass start at y = 7.
 * - All rows of a part must have the same length (island-model.spec.ts checks this).
 * - The fallback / placeholder SVG is drawn from this same data, so it follows every edit.
 */

export type Vec3 = readonly [x: number, y: number, z: number];

/** Bottom layer first; each layer is rows back → front, each row left → right. */
export type VoxelLayers = readonly (readonly string[])[];

export interface VoxelPart {
  /** Grid position of the part's first voxel (bottom layer, back row, left column). */
  readonly at: Vec3;
  readonly layers: VoxelLayers;
  /** Point the part rotates around when it animates (island grid units), e.g. a shoulder. */
  readonly pivot?: Vec3;
}

export const PALETTE: Readonly<Record<string, string>> = {
  // Island
  G: '#3fa34d', // grass
  g: '#2e7d32', // dark grass
  Y: '#6fcf5f', // light grass tuft
  D: '#8b5a2b', // dirt
  d: '#6b4320', // dark dirt
  S: '#a3a3b5', // stone
  s: '#6e6e82', // dark stone
  y: '#ffd23f', // yellow flower
  r: '#e63946', // red flower / apple
  A: '#3fa9f5', // water
  a: '#8fd3ff', // light water
  // Tree
  T: '#6d4c41', // trunk
  L: '#4caf50', // leaves
  l: '#2f8a3a', // dark leaves
  // Furniture
  W: '#c68a4e', // desk top
  w: '#8b5a2b', // desk legs
  C: '#e63946', // chair
  c: '#3d3557', // chair base
  M: '#2a2a3a', // monitor casing
  m: '#4a4a5c', // monitor stand
  X: '#0b0b14', // screen (the scrolling code texture covers its front face)
  K: '#d9d1bd', // keyboard
  k: '#6e6e82', // keys
  U: '#fff8e7', // mug
  // Kenan
  H: '#3b2416', // hair
  F: '#e0a97e', // skin
  E: '#0b0b14', // eyes
  B: '#2f5bff', // hoodie
  b: '#2445c8', // hoodie trim / hood
  P: '#2b2b3a', // trousers
  O: '#0b0b14', // shoes
  // Sky
  Q: '#ffffff', // cloud
  q: '#d4e3ff', // cloud shade
  R: '#2b2b3a', // bird
  V: '#4a4a5c', // bird wing
};

/** The island grid is 18 voxels wide (x) and 16 deep (z); its centre is the turning point. */
export const ISLAND_CENTER: Vec3 = [9, 0, 8];

const island: VoxelPart = {
  at: [0, 0, 0],
  layers: [
    // y = 0: the stepped point underneath
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '.......SDDd.......',
      '.......DDDD.......',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    // y = 1
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '.......DDDD.......',
      '......DdDDDS......',
      '......DDDDdD......',
      '.......DDDD.......',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    // y = 2
    [
      '..................',
      '..................',
      '..................',
      '..................',
      '......DDDDDD......',
      '.....dDDDDDDD.....',
      '....SDDDDdDSDD....',
      '....DDDdDDDDDD....',
      '....DdDDDDDDDD....',
      '....DDDDDDDDDD....',
      '.....dDSDdSDd.....',
      '......DdDDdD......',
      '..................',
      '..................',
      '..................',
      '..................',
    ],
    // y = 3
    [
      '..................',
      '..................',
      '.....DDDDDDSd.....',
      '....SSDdDDDdDd....',
      '...DDdDSDDDSDdD...',
      '..DDDddDSDDDDSdD..',
      '..dDDSDDDDDDdDDD..',
      '..dDDDDDDDDDdDDD..',
      '..DDDdDdDDDDDdDd..',
      '..DDDDDDDSDDdDDd..',
      '..DDSDDDDDDSDDDD..',
      '...SddddSDDdddD...',
      '....dDDDDDDDSd....',
      '.....DDdDDddD.....',
      '..................',
      '..................',
    ],
    // y = 4
    [
      '..................',
      '....dSDDDDDSDD....',
      '...SSDddDDDDDDD...',
      '..DDDDDDDDDDDDDD..',
      '.DDDDDSDDDDDDddDd.',
      '.DDDDDDDDDDDDDdDd.',
      '.DDDDDdDDSdDSDDdd.',
      '.DDddDSDDDdDDDDDD.',
      '.DDDdSDdDDdDDDdDS.',
      '.DDDDDdDDDDDDDDDd.',
      '.DddDDSSDDDDDdSDD.',
      '.dDDdSSdDDDDDDDDD.',
      '..DDDDDdSDDDDDDd..',
      '...SSDDdDdSSDDS...',
      '....DDDDDSDdDD....',
      '..................',
    ],
    // y = 5
    [
      '...SdDDdDDDDDDD...',
      '..DDDDDDDDDDDDDd..',
      '.DDDDDDSddSDDDDDD.',
      'dDDDDDDDDdDDDDDDDD',
      'DDDDDdddDDDDDDDddS',
      'DDdDDDdDDDddDdDDDD',
      'DDDdDDDDDDDSdDDDDD',
      'dDDdDDDDDSDDDDDSDD',
      'DDDdDDDSDDDDDDDDdd',
      'DDSDDDdDDDDDSDDDDD',
      'DDDDDDDDDDSDSDddDd',
      'DdDDDDSDDDDSdSDDDD',
      'DDDSdDDdDDDDDdDDDD',
      '.dDdDDDDDDDDdddDD.',
      '..DDdDDSDDDdSDDd..',
      '...DSDDDDDDDDDS...',
    ],
    // y = 6: grass top, with the stream that feeds the waterfall on the right edge
    [
      '..YggGgGGGGGGGGG..',
      '.YGGGGGGGGGGGGGGG.',
      'GGGGGYGGGGGGgGGGgG',
      'GgGGGGGGgGGGgGgGGG',
      'GgGGGGgGGGYgGgGGYG',
      'GGYGGGGGGYgGGGgGgg',
      'GGGGGgGYGGGgYGGYGG',
      'YGGGGGYGGGYGGGGGGG',
      'gGGGGGGGGGgGgGGGYG',
      'YGggGGGGGGGGGGGggg',
      'gGGGggGGGGGGGaAAAA',
      'GGGGGGGggGGGgAAAAA',
      'GGgGGGGGGgGGgGGgGG',
      'GgGGGGGGGGGGGgGGGY',
      '.GGGGGGgYGgGGGGgG.',
      '..GYGGGGGgYGGGgG..',
    ],
    // y = 7: stones, flowers and tufts on the grass
    [
      '..................',
      '..................',
      '............y.....',
      '...............Ss.',
      '................S.',
      '..................',
      '..................',
      '................Y.',
      '...r..............',
      '.S................',
      '..................',
      '..................',
      '.....y............',
      '..............r...',
      '......Y...........',
      '..................',
    ],
  ],
};

const tree: VoxelPart = {
  at: [1, 7, 9],
  layers: [
    ['.....', '.....', '..T..', '.....', '.....'],
    ['.....', '.....', '..T..', '.....', '.....'],
    ['.....', '.....', '..T..', '.....', '.....'],
    ['.lLl.', 'lLLLl', 'LLTLL', 'lLLLl', '.lLl.'],
    ['.LLL.', 'LLLLL', 'LLLLL', 'LLLLr', '.LLL.'],
    ['..L..', '.LLL.', 'LLLLl', '.LLL.', '..l..'],
    ['.....', '..L..', '.LLL.', '..L..', '.....'],
  ],
};

const desk: VoxelPart = {
  at: [6, 7, 5],
  layers: [
    ['w......w', '........', 'w......w'],
    ['w......w', '........', 'w......w'],
    ['w......w', '........', 'w......w'],
    ['WWWWWWWW', 'WWWWWWWW', 'WWWWWWWW'],
  ],
};

/** Faces the front; the code texture is drawn over the front of its 'X' voxels. */
const monitor: VoxelPart = {
  at: [8, 11, 5],
  layers: [['..mm..'], ['MMMMMM'], ['MXXXXM'], ['MXXXXM'], ['MXXXXM'], ['MMMMMM']],
};

const keyboard: VoxelPart = {
  at: [7, 11, 7],
  layers: [['KkKk']],
};

const mug: VoxelPart = {
  at: [12, 11, 7],
  layers: [['U']],
};

const chair: VoxelPart = {
  at: [7, 7, 9],
  layers: [
    ['c..c', '.cc.', '.cc.', 'c..c'],
    ['....', '.cc.', '.cc.', '....'],
    ['CCCC', 'CCCC', 'CCCC', 'CCCC'],
    ['....', '....', '....', 'CCCC'],
    ['....', '....', '....', 'CCCC'],
  ],
};

// Kenan sits on the chair facing the monitor (his back is towards the viewer).

const torso: VoxelPart = {
  at: [7, 7, 8],
  layers: [
    ['OOOO', '....', '....', '....', '....'],
    ['PPPP', '....', '....', '....', '....'],
    ['PPPP', '....', '....', '....', '....'],
    ['PPPP', 'PPPP', 'PPPP', 'PPPP', '....'],
    ['....', '....', 'bbbb', 'bbbb', '....'],
    ['....', '....', 'BBBB', 'BBBB', '....'],
    ['....', '....', 'BBBB', 'BBBB', '.bb.'],
  ],
};

/** The front row (z = 9) is his face; the viewer sees the back and right side of his head. */
const head: VoxelPart = {
  at: [7, 14, 9],
  layers: [
    ['FFFF', 'FFFF', 'HFFH', 'HHHH'],
    ['FFFF', 'FFFF', 'HFFH', 'HHHH'],
    ['EFFE', 'FFFF', 'HHHH', 'HHHH'],
    ['HHHH', 'HHHH', 'HHHH', 'HHHH'],
  ],
};

const leftArm: VoxelPart = {
  at: [6, 12, 7],
  pivot: [6.5, 13.5, 10.5],
  layers: [
    ['.F', '.B', 'BB', 'B.'],
    ['..', '..', '..', 'B.'],
  ],
};

const rightArm: VoxelPart = {
  at: [10, 12, 7],
  pivot: [11.5, 13.5, 10.5],
  layers: [
    ['F.', 'B.', 'BB', '.B'],
    ['..', '..', '..', '.B'],
  ],
};

/** Static scenery. Their colours cycle during the easter-egg celebration. */
export const SCENERY = { island, tree, desk, monitor, keyboard, mug, chair } as const;

/** Kenan's parts, animated separately (typing arms, hop). */
export const CHARACTER = { torso, head, leftArm, rightArm } as const;

export interface Waterfall {
  /** Top voxel of the column; the water falls straight down from there. */
  readonly at: Vec3;
  /** Column size in voxels: across (x) and deep (z). */
  readonly width: number;
  readonly depth: number;
  /** How many voxels tall the falling column is. */
  readonly length: number;
  /** Palette characters repeating down the column. */
  readonly colors: string;
}

/** Pours off the right edge where the stream (y = 6) ends. */
export const WATERFALL: Waterfall = {
  at: [18, 6, 10],
  width: 1,
  depth: 2,
  length: 12,
  colors: 'AAaA',
};

/** Steam puffs rise from this point (just above the mug). */
export const STEAM_ORIGIN: Vec3 = [12.5, 12, 7.5];

const bigCloud: VoxelLayers = [
  ['..qqqq..', '.qqqqqqq', 'qqqqqqqq', '.qqqqqq.'],
  ['..QQQ...', '.QQQQQQ.', 'QQQQQQQQ', '..QQQQ..'],
  ['........', '..QQQ...', '.QQQQQ..', '........'],
];

const smallCloud: VoxelLayers = [
  ['.qqq.', 'qqqqq', '.qqq.'],
  ['.QQ..', 'QQQQQ', '..QQ.'],
];

/**
 * Start positions; clouds drift to the right of the screen and wrap around once they leave it.
 * `speed` in voxels per second. Low x + z keeps a cloud behind the island.
 */
export const CLOUDS: readonly { readonly at: Vec3; readonly layers: VoxelLayers; readonly speed: number }[] =
  [
    { at: [-2, 16, 14], layers: bigCloud, speed: 0.7 },
    { at: [13, 19, 0], layers: smallCloud, speed: 1 },
    { at: [15, 8, -2], layers: bigCloud, speed: 0.55 },
    { at: [0, 0, 18], layers: smallCloud, speed: 0.9 },
    { at: [5, 21, 8], layers: smallCloud, speed: 0.8 },
  ];

/** Two flap frames, facing right (+x), body on the bottom layer. */
export const BIRD_FRAMES: readonly [VoxelLayers, VoxelLayers] = [
  [
    ['....', '....', 'RRRy', '....', '....'],
    ['....', '.V..', '....', '.V..', '....'],
    ['.V..', '....', '....', '....', '.V..'],
  ],
  [['.V..', '.V..', 'RRRy', '.V..', '.V..']],
];

/** Birds circle the island centre; `speed` in radians per second (negative = clockwise). */
export const BIRDS: readonly { readonly radius: number; readonly y: number; readonly speed: number; readonly phase: number }[] =
  [
    { radius: 12, y: 17, speed: 0.32, phase: 0 },
    { radius: 10, y: 15, speed: 0.4, phase: 2.2 },
    { radius: 13, y: 19, speed: -0.26, phase: 4.1 },
  ];
