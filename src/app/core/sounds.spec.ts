import { SOUNDS, frequency } from './sounds';

describe('sounds', () => {
  it('converts note names to equal-temperament frequencies', () => {
    expect(frequency('A4')).toBeCloseTo(440, 5);
    expect(frequency('A5')).toBeCloseTo(880, 5);
    expect(frequency('C4')).toBeCloseTo(261.626, 2);
    expect(frequency('F#4')).toBeCloseTo(369.994, 2);
    expect(frequency(1320)).toBe(1320);
  });

  it('only uses valid notes', () => {
    Object.values(SOUNDS).forEach((voices) =>
      voices.forEach((voice) =>
        voice.notes.forEach((note) => {
          expect(() => frequency(note.pitch)).not.toThrow();

          if (note.slideTo !== undefined) {
            expect(() => frequency(note.slideTo!)).not.toThrow();
          }
        }),
      ),
    );
  });
});
