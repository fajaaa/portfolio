import { BIRD_FRAMES, CHARACTER, CLOUDS, PALETTE, SCENERY, VoxelLayers } from './island-model';
import { createIslandSprite } from './island-sprite';
import { partVoxels } from './voxels';

const MODELS: Record<string, VoxelLayers> = {
  ...Object.fromEntries(
    Object.entries({ ...SCENERY, ...CHARACTER }).map(([name, part]) => [name, part.layers]),
  ),
  ...Object.fromEntries(CLOUDS.map((cloud, i) => [`cloud ${i}`, cloud.layers])),
  ...Object.fromEntries(BIRD_FRAMES.map((frame, i) => [`bird frame ${i}`, frame])),
};

describe('island model', () => {
  for (const [name, layers] of Object.entries(MODELS)) {
    it(`${name}: every layer has the same rows and row length`, () => {
      const rows = layers[0].length;
      const width = layers[0][0].length;

      layers.forEach((layer, y) => {
        expect(layer.length).withContext(`${name} layer ${y} rows`).toBe(rows);
        layer.forEach((row, z) =>
          expect(row.length).withContext(`${name} layer ${y} row ${z}`).toBe(width),
        );
      });
    });

    it(`${name}: only uses palette characters`, () => {
      const unknown = layers.flat().join('').replace(/\./g, '').split('').filter((c) => !PALETTE[c]);

      expect(unknown).withContext(name).toEqual([]);
    });
  }

  it('parts never overlap each other', () => {
    const seen = new Map<string, string>();
    const overlaps: string[] = [];

    for (const [name, part] of Object.entries({ ...SCENERY, ...CHARACTER })) {
      for (const { x, y, z } of partVoxels(part)) {
        const key = `${x},${y},${z}`;
        const other = seen.get(key);

        if (other) {
          overlaps.push(`${name} / ${other} at ${key}`);
        }
        seen.set(key, name);
      }
    }

    expect(overlaps).toEqual([]);
  });

  it('draws the fallback sprite', () => {
    const sprite = createIslandSprite();

    expect(sprite.size).toBeGreaterThan(0);
    expect(sprite.paths.length).toBeGreaterThan(10);
  });
});
