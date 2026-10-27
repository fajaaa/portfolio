import type { PixelSprite } from '../ui/pixel-art/pixel-art.component';

/** Kenan as a 2D NPC, matching the hero's voxel character (dark brown hair, blue hoodie). */
const NPC_PALETTE = {
  X: 'var(--ink)', // outline
  H: '#3b2416', // hair
  h: '#5a3a26', // hair highlight
  F: '#e0a97e', // skin
  f: '#c4875c', // skin shade (closed mouth)
  E: 'var(--ink)', // eyes
  M: '#7a2630', // open mouth
  B: '#2f5bff', // hoodie
  b: '#2445c8', // hoodie trim / hood
  S: 'var(--paper)', // hoodie strings
  P: '#2b2b3a', // trousers
  O: '#4a4a5c', // shoes
} as const;

const NPC_ROWS = [
  '......XXXXXX......',
  '....XXHHHHHHXX....',
  '...XHHHHhhHHHHX...',
  '..XHHHhhHHHHHHHX..',
  '..XHHHHHHHHHHHHX..',
  '..XHHHHHHFFFFHHX..',
  '..XHHFFFFFFFFFHX..',
  '..XHFEFFFFFFEFHX..',
  '..XHFEFFFFFFEFHX..',
  '..XFFFFFFFFFFFFX..',
  '..XFFFFffffFFFFX..', // mouth
  '...XFFFFFFFFFFX...',
  '....XXFFFFFFXX....',
  '...XbbbFFFFbbbX...', // hood around the neck
  '..XBBbbbbbbbbBBX..',
  '.XBBBBBSBBSBBBBBX.',
  '.XBBXBBSBBSBBXBBX.',
  '.XBBXBBBBBBBBXBBX.',
  '.XBBXBbbbbbbBXBBX.',
  '.XFFXbbbbbbbbXFFX.',
  '..XXXPPPPPPPPXXX..',
  '....XPPPPPPPPX....',
  '....XPPPXXPPPX....',
  '....XPPPXXPPPX....',
  '...XOOOOXXOOOOX...',
  '...XXXXX..XXXXX...',
];

const MOUTH_ROW = 10;
const NECK_ROW = 13;

/** Idle frame 1: standing. */
export const NPC_IDLE: PixelSprite = { rows: NPC_ROWS, palette: NPC_PALETTE };

/** Idle frame 2: the head sinks one pixel into the hood (a breathing bob). */
export const NPC_BOB: PixelSprite = {
  rows: [
    '.'.repeat(NPC_ROWS[0].length),
    ...NPC_ROWS.slice(0, NECK_ROW),
    ...NPC_ROWS.slice(NECK_ROW + 1),
  ],
  palette: NPC_PALETTE,
};

/** Talking frame: mouth open. */
export const NPC_TALK: PixelSprite = {
  rows: NPC_ROWS.map((row, y) => {
    if (y === MOUTH_ROW) {
      return '..XFFFFMMMMFFFFX..';
    }

    return y === MOUTH_ROW + 1 ? '...XFFFFMMFFFFX...' : row;
  }),
  palette: NPC_PALETTE,
};

/* ---------- FAST TRAVEL icons (`X` = currentColor) ---------- */

export const MAIL_SPRITE: PixelSprite = {
  rows: [
    'XXXXXXXXXXX',
    'XXX.....XXX',
    'X.XX...XX.X',
    'X..XX.XX..X',
    'X...XXX...X',
    'X.........X',
    'X.........X',
    'XXXXXXXXXXX',
  ],
  palette: { X: 'currentColor' },
};

/** "in" cut out of a square. */
export const LINKEDIN_SPRITE: PixelSprite = {
  rows: [
    'XXXXXXXXX',
    'X.XXXXXXX',
    'XXXXXXXXX',
    'X.X...XXX',
    'X.X.XX.XX',
    'X.X.XX.XX',
    'X.X.XX.XX',
    'X.X.XX.XX',
    'XXXXXXXXX',
  ],
  palette: { X: 'currentColor' },
};

/** A tiny octocat. */
export const GITHUB_SPRITE: PixelSprite = {
  rows: [
    '.X.......X.',
    '.XX.....XX.',
    '.XXXXXXXXX.',
    'XXXXXXXXXXX',
    'XX..XXX..XX',
    'XX..XXX..XX',
    'XXXXXXXXXXX',
    '.XXXXXXXXX.',
    '..XXXXXXX..',
    '...X...X...',
    '..X.....X..',
  ],
  palette: { X: 'currentColor' },
};
