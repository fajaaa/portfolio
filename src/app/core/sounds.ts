/** 8-bit sound effects as note lists, synthesized by `SoundService` (no audio files). */

export type SoundName =
  | 'hover'
  | 'select'
  | 'back'
  | 'coin'
  | 'tick'
  | 'powerUp'
  | 'start'
  | 'gameOver';

export interface Note {
  /** Note name (`'C5'`, `'F#4'`) or a frequency in Hz. */
  readonly pitch: string | number;
  /** Seconds. */
  readonly length: number;
  /** Slides to this pitch over the note. */
  readonly slideTo?: string | number;
}

/** One oscillator playing its notes back to back. */
export interface Voice {
  readonly wave: 'square' | 'triangle';
  /** 0–1, relative to the master volume. */
  readonly volume: number;
  readonly notes: readonly Note[];
  /** Silence before the first note, in seconds. */
  readonly delay?: number;
}

/** Equal-length notes from a space-separated list. */
function run(pitches: string, length: number): Note[] {
  return pitches.split(' ').map((pitch) => ({ pitch, length }));
}

export const SOUNDS: Readonly<Record<SoundName, readonly Voice[]>> = {
  hover: [{ wave: 'square', volume: 0.25, notes: [{ pitch: 1320, length: 0.025 }] }],
  select: [{ wave: 'square', volume: 0.5, notes: run('E5 B5', 0.05) }],
  back: [{ wave: 'square', volume: 0.5, notes: run('B5 E5', 0.05) }],
  coin: [
    {
      wave: 'square',
      volume: 0.55,
      notes: [
        { pitch: 'A5', length: 0.07 },
        { pitch: 'E6', length: 0.28 },
      ],
    },
  ],
  tick: [{ wave: 'square', volume: 0.08, notes: [{ pitch: 2200, length: 0.012 }] }],
  powerUp: [
    { wave: 'square', volume: 0.45, notes: run('C5 E5 G5 C6 E6 G6 C7', 0.055) },
    {
      wave: 'triangle',
      volume: 0.6,
      notes: [{ pitch: 'C3', length: 0.38, slideTo: 'C4' }],
    },
  ],
  start: [
    {
      wave: 'square',
      volume: 0.45,
      notes: [...run('G4 C5 E5 G5', 0.085), { pitch: 'C6', length: 0.34 }],
    },
    {
      wave: 'triangle',
      volume: 0.7,
      notes: [...run('C3 G3', 0.17), { pitch: 'C3', length: 0.34 }],
    },
  ],
  gameOver: [
    {
      wave: 'square',
      volume: 0.45,
      notes: [...run('C5 B4 A#4 A4', 0.2), { pitch: 'G4', length: 0.7, slideTo: 'D4' }],
    },
    {
      wave: 'triangle',
      volume: 0.7,
      notes: [...run('E3 D#3 D3 C#3', 0.2), { pitch: 'C3', length: 0.7 }],
    },
  ],
};

const SEMITONES: Readonly<Record<string, number>> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

/** `'A4'` → 440 (equal temperament); numbers pass through. */
export function frequency(pitch: string | number): number {
  if (typeof pitch === 'number') {
    return pitch;
  }

  const match = /^([A-G]#?)(\d)$/.exec(pitch);

  if (!match) {
    throw new Error(`Unknown note: ${pitch}`);
  }

  const fromA4 = SEMITONES[match[1]] - 9 + (Number(match[2]) - 4) * 12;
  return 440 * 2 ** (fromA4 / 12);
}
