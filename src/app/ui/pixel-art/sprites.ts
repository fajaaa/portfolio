import { PixelSprite } from './pixel-art.component';

/** Shared UI sprites. `X` pixels use `currentColor`, so they follow the text color. */

export const LOGO_SPRITE: PixelSprite = {
  rows: [
    '.XXXXXXXXXXX.',
    'XCCCCCCCCCCCX',
    'XCKCCKCFFFFCX',
    'XCKCKCCFCCCCX',
    'XCKKCCCFFFCCX',
    'XCKCKCCFCCCCX',
    'XCKCCKCFCCCCX',
    'XCCCCCCCCCCCX',
    '.XXXXXXXXXXX.',
  ],
  palette: { X: 'var(--ink)', K: 'var(--ink)', F: 'var(--ink)', C: 'var(--coin)' },
};

/** ▶ menu marker. */
export const MARKER_SPRITE: PixelSprite = {
  rows: ['X...', 'XX..', 'XXX.', 'XXXX', 'XXX.', 'XX..', 'X...'],
  palette: { X: 'currentColor' },
};

/** ▲ */
export const ARROW_UP_SPRITE: PixelSprite = {
  rows: ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX'],
  palette: { X: 'currentColor' },
};

export const CLOSE_SPRITE: PixelSprite = {
  rows: ['XX...XX', 'XXX.XXX', '.XXXXX.', '..XXX..', '.XXXXX.', 'XXX.XXX', 'XX...XX'],
  palette: { X: 'currentColor' },
};

/** Arrow down into a tray. */
export const DOWNLOAD_SPRITE: PixelSprite = {
  rows: [
    '..XXX..',
    '..XXX..',
    '..XXX..',
    'XXXXXXX',
    '.XXXXX.',
    '..XXX..',
    '...X...',
    'X.....X',
    'XXXXXXX',
  ],
  palette: { X: 'currentColor' },
};
