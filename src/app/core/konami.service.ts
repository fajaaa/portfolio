import { Injectable, NgZone, inject } from '@angular/core';

import { HeroSceneService } from './hero-scene.service';
import { I18nService } from './i18n.service';
import { IntroService } from './intro.service';
import { MotionService } from './motion.service';
import { SoundService } from './sound.service';
import { ToastService } from './toast.service';

const CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];
const COOLDOWN_MS = 10_000;
const LOGO_TAPS = 5;
const LOGO_TAP_WINDOW_MS = 2000;

/**
 * Easter egg: ↑↑↓↓←→←→BA on the keyboard (not while typing in a field), or 5 taps on the HUD
 * logo within 2 s. Shows a "CHEAT CODE ACTIVATED" toast, bursts pixel coins from the middle
 * of the screen, plays the power-up sound and makes the hero island celebrate. Under reduced
 * motion only the toast. At most once every 10 s.
 */
@Injectable({ providedIn: 'root' })
export class KonamiService {
  private readonly zone = inject(NgZone);
  private readonly i18n = inject(I18nService);
  private readonly intro = inject(IntroService);
  private readonly motion = inject(MotionService);
  private readonly sound = inject(SoundService);
  private readonly toast = inject(ToastService);
  private readonly heroScene = inject(HeroSceneService);
  private keys: string[] = [];
  private taps: number[] = [];
  private lastActivation = -Infinity;

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.repeat || isTyping(event.target)) {
      return;
    }

    this.keys = [...this.keys, event.key.toLowerCase()].slice(-CODE.length);

    if (this.keys.join() === CODE.join()) {
      this.keys = [];
      this.zone.run(() => this.activate());
    }
  };

  /** Starts listening for the code; call from `afterNextRender`. Returns a function that stops. */
  connect(): () => void {
    this.zone.runOutsideAngular(() => window.addEventListener('keydown', this.onKeydown));

    return () => window.removeEventListener('keydown', this.onKeydown);
  }

  /** Counts a tap on the HUD logo (the touch version of the code). */
  registerLogoTap(): void {
    const now = performance.now();
    this.taps = [...this.taps.filter((tap) => now - tap < LOGO_TAP_WINDOW_MS), now];

    if (this.taps.length >= LOGO_TAPS) {
      this.taps = [];
      this.activate();
    }
  }

  private activate(): void {
    const now = performance.now();

    if (this.intro.visible() || now - this.lastActivation < COOLDOWN_MS) {
      return;
    }

    this.lastActivation = now;
    this.toast.show({
      key: 'konami',
      title: this.i18n.t('konami.title'),
      detail: this.i18n.t('konami.detail'),
      duration: 3000,
    });

    if (this.motion.reducedMotion()) {
      return;
    }

    this.sound.play('powerUp');
    this.heroScene.celebrate();
    // Loaded on demand: most visitors never find the code.
    this.zone.runOutsideAngular(() =>
      import('./coin-burst').then(({ coinBurst }) => coinBurst()),
    );
  }
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
