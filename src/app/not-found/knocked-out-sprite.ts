import { NPC_IDLE } from '../contact/contact-sprites';
import type { PixelSprite } from '../ui/pixel-art/pixel-art.component';

/** The sprite turned 90° counter-clockwise: lying on its back, head on the left. */
function lyingDown({ rows, palette }: PixelSprite): PixelSprite {
  const width = Math.max(...rows.map((row) => row.length));

  return {
    rows: Array.from({ length: width }, (_, y) =>
      rows.map((row) => row[width - 1 - y] ?? '.').join(''),
    ),
    palette,
  };
}

/** Kenan's NPC sprite, knocked out for the GAME OVER screen. */
export const KNOCKED_OUT_SPRITE = lyingDown(NPC_IDLE);
