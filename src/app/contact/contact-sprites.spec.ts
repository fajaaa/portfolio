import { NPC_BOB, NPC_IDLE, NPC_TALK, SAVE_CRYSTAL_SPRITE } from './contact-sprites';

describe('contact sprites', () => {
  it('draws every NPC frame at 18x26', () => {
    for (const frame of [NPC_IDLE, NPC_BOB, NPC_TALK]) {
      expect(frame.rows.length).toBe(26);
      frame.rows.forEach((row) => expect(row.length).toBe(18));
    }
  });

  it('draws the save crystal with equal-length rows and a color for every pixel', () => {
    const widths = new Set(SAVE_CRYSTAL_SPRITE.rows.map((row) => row.length));
    expect(widths.size).toBe(1);

    for (const char of SAVE_CRYSTAL_SPRITE.rows.join('').replaceAll('.', '')) {
      expect(SAVE_CRYSTAL_SPRITE.palette[char]).withContext(char).toBeTruthy();
    }
  });
});
