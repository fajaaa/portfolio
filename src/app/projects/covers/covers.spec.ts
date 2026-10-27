import type { PixelSprite } from '../../ui/pixel-art/pixel-art.component';
import { COVERS, coverFor } from './covers';
import { COVER_HEIGHT, COVER_WIDTH, genericCover } from './generic-cover';

function expectValidCover(cover: PixelSprite): void {
  expect(cover.rows.length).toBe(COVER_HEIGHT);

  for (const row of cover.rows) {
    expect(row.length).toBe(COVER_WIDTH);

    for (const char of row) {
      expect(cover.palette[char]).withContext(`color for "${char}"`).toBeTruthy();
    }
  }
}

describe('project covers', () => {
  it('registers only full-size covers with a color for every pixel', () => {
    Object.values(COVERS).forEach(expectValidCover);
  });

  it('finds hand-made covers case-insensitively', () => {
    expect(coverFor('AquaControl')).toBe(COVERS['aquacontrol']);
    expect(coverFor('IOT-project-smart-safe')).toBe(COVERS['iot-project-smart-safe']);
  });

  it('generates a valid, stable and unique cover for unknown repositories', () => {
    const first = coverFor('weather-app');

    expectValidCover(first);
    expect(genericCover('weather-app').rows).toEqual(first.rows);
    expect(genericCover('todo-list').rows).not.toEqual(first.rows);
  });
});
