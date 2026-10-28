import type { PixelSprite } from '../../ui/pixel-art/pixel-art.component';
import { AQUA_CONTROL_COVER } from './aqua-control.cover';
import { AQUA_FLOW_COVER } from './aqua-flow.cover';
import { genericCover } from './generic-cover';
import { SMART_SAFE_COVER } from './smart-safe.cover';

/**
 * Cartridge cover art, keyed by GitHub repository name (matched case-insensitively).
 * Repositories without an entry get a generated cover (see `generic-cover.ts`).
 *
 * Adding a hand-made cover:
 * 1. Create `<name>.cover.ts` in this folder exporting a `PixelSprite`: 24 strings of exactly
 *    32 characters (one character per pixel) and a palette mapping every character used to a
 *    color. Use the brief's palette variables (`var(--w14-bg)`, `var(--ink)`, ...) and give every
 *    pixel a color: a cover is a full picture, not a sprite on a transparent background.
 * 2. Add it to `COVERS` below under the repository name.
 * 3. `covers.spec.ts` checks the size and palette of every registered cover.
 */
export const COVERS: Readonly<Record<string, PixelSprite>> = {
  aquacontrol: AQUA_CONTROL_COVER,
  aquaflow: AQUA_FLOW_COVER,
  'iot-project-smart-safe': SMART_SAFE_COVER,
};

export function coverFor(repositoryName: string): PixelSprite {
  return COVERS[repositoryName.toLowerCase()] ?? genericCover(repositoryName);
}
