import { SKILL_ICON_SIZE, SKILL_ICONS } from './skill-icons';
import { SKILLS } from './skills.data';

describe('skill icons', () => {
  it('has a 16x16 icon for every skill, with a color for every non-transparent pixel', () => {
    for (const skill of SKILLS) {
      const icon = SKILL_ICONS[skill.id];

      expect(icon).withContext(skill.id).toBeTruthy();
      expect(icon.rows.length).withContext(skill.id).toBe(SKILL_ICON_SIZE);

      for (const row of icon.rows) {
        expect(row.length).withContext(skill.id).toBe(SKILL_ICON_SIZE);

        for (const char of row.replaceAll('.', '')) {
          expect(icon.palette[char]).withContext(`${skill.id}: color for "${char}"`).toBeTruthy();
        }
      }
    }
  });

  it('fills the 5-column roster without gaps', () => {
    expect(SKILLS.length % 5).toBe(0);
    expect(new Set(SKILLS.map((skill) => skill.id)).size).toBe(SKILLS.length);
  });
});
