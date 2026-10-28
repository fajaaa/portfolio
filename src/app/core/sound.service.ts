import { Injectable, NgZone, inject, signal } from '@angular/core';

import { SOUNDS, SoundName, Voice, frequency } from './sounds';

const STORAGE_KEY = 'kf.sound';
const MASTER_VOLUME = 0.15;
const HOVER_THROTTLE_MS = 80;
/** Events that count as a user gesture for starting audio. */
const GESTURE_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'keydown'] as const;

type AudioContextConstructor = typeof AudioContext;

/**
 * 8-bit sound effects synthesized with Web Audio (square / triangle oscillators, no files).
 *
 * Muted by default; the choice is persisted in `kf.sound`. The AudioContext is only created
 * once sound is on and the user has interacted with the page, so nothing ever plays before
 * they opt in. Playback runs outside the Angular zone.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private readonly zone = inject(NgZone);
  private readonly on = signal(this.initialSetting());
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private hasGesture = false;
  private lastHover = 0;
  private readonly finePointer =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(hover: hover) and (pointer: fine)')
      : undefined;

  readonly enabled = this.on.asReadonly();

  private readonly onGesture = () => {
    this.hasGesture = true;

    if (this.on()) {
      this.unlock();
    }
  };

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.zone.runOutsideAngular(() =>
      GESTURE_EVENTS.forEach((type) =>
        window.addEventListener(type, this.onGesture, { capture: true, passive: true }),
      ),
    );
  }

  setEnabled(enabled: boolean): void {
    this.on.set(enabled);

    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // Storage blocked: the choice just lasts for this visit.
    }

    if (enabled) {
      this.unlock();
    } else {
      void this.context?.suspend();
    }
  }

  toggle(): void {
    this.setEnabled(!this.on());
  }

  play(name: SoundName): void {
    const context = this.context;

    if (!this.on() || !context || !this.master) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const start = context.currentTime + 0.01;
      SOUNDS[name].forEach((voice) => this.playVoice(context, voice, start));
    });
  }

  /** Hover blip: mouse / trackpad only, at most one every 80 ms. */
  hover(event?: Event): void {
    if ((event && (event as PointerEvent).pointerType !== 'mouse') || !this.finePointer?.matches) {
      return;
    }

    const now = performance.now();

    if (now - this.lastHover >= HOVER_THROTTLE_MS) {
      this.lastHover = now;
      this.play('hover');
    }
  }

  /** Creates / resumes the AudioContext; only does anything after a user gesture. */
  private unlock(): void {
    const sticky = typeof navigator !== 'undefined' && navigator.userActivation?.hasBeenActive;

    if (!this.hasGesture && !sticky) {
      return;
    }

    if (!this.context) {
      const Context =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;

      if (!Context) {
        return;
      }

      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = MASTER_VOLUME;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    if (this.context.state !== 'closed') {
      GESTURE_EVENTS.forEach((type) =>
        window.removeEventListener(type, this.onGesture, { capture: true }),
      );
    }
  }

  private playVoice(context: AudioContext, voice: Voice, start: number): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    let time = start + (voice.delay ?? 0);

    oscillator.type = voice.wave;
    gain.gain.setValueAtTime(0, time);

    // Each note gets a quick attack and a decay to silence: short, plucky chip-tune notes.
    voice.notes.forEach((note) => {
      const end = time + note.length;

      oscillator.frequency.setValueAtTime(frequency(note.pitch), time);

      if (note.slideTo !== undefined) {
        oscillator.frequency.linearRampToValueAtTime(frequency(note.slideTo), end);
      }

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(voice.volume, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      time = end;
    });

    oscillator.connect(gain).connect(this.master!);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(time + 0.02);
  }

  private initialSetting(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
