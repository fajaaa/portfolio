import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

import { HeroSceneService } from '../core/hero-scene.service';
import { I18nService } from '../core/i18n.service';
import { IntroService } from '../core/intro.service';
import { MotionService } from '../core/motion.service';
import { SmoothScrollService } from '../core/smooth-scroll.service';
import { SoundService } from '../core/sound.service';
import { LANGS, Lang } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { LOGO_SPRITE, MARKER_SPRITE } from '../ui/pixel-art/sprites';
import { PixelProgressComponent } from '../ui/pixel-progress/pixel-progress.component';

type Phase = 'loading' | 'menu' | 'starting' | 'leaving';

const MIN_LOADING_MS = 1000;
const MAX_LOADING_MS = 2500;
/** How long "PRESS START" flashes before the wipe. */
const STARTING_MS = 300;
/** The tiles disappear diagonally over this long, then each takes TILE_MS. */
const WIPE_SPREAD_MS = 480;
const TILE_MS = 240;

interface Tile {
  readonly id: number;
  readonly delay: number;
}

/**
 * First-visit PRESS START screen over the (already rendered) page: the KF logo drops in, a
 * loading bar waits for the fonts and the hero's first frame (1–2.5 s), then "PRESS START" with
 * LANGUAGE and SOUND selectors. ↑/↓ move between rows, ←/→ change a setting, Enter / click /
 * tap start. SKIP and Esc close it at any time. Closing plays a stepped pixel wipe, then sets
 * `introDone` so the hero entrance runs. Page scrolling is locked while it's open.
 */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelArtComponent, PixelProgressComponent, TranslatePipe],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'intro-title',
    tabindex: '-1',
    '[class.intro--starting]': 'phase() === "starting"',
    '[class.intro--leaving]': 'phase() === "leaving"',
    '[style.--cols]': 'columns()',
    '[style.--rows]': 'rows()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class IntroComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly injector = inject(Injector);
  private readonly intro = inject(IntroService);
  private readonly heroScene = inject(HeroSceneService);
  private readonly motion = inject(MotionService);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private loadingTimer: ReturnType<typeof setInterval> | undefined;
  private scrollLocked = false;

  protected readonly i18n = inject(I18nService);
  protected readonly sound = inject(SoundService);
  protected readonly logo = LOGO_SPRITE;
  protected readonly marker = MARKER_SPRITE;
  protected readonly langs = LANGS;
  protected readonly phase = signal<Phase>('loading');
  protected readonly percent = signal(0);
  protected readonly columns = signal(1);
  protected readonly rows = signal(1);
  protected readonly tiles = signal<readonly Tile[]>([]);

  constructor() {
    afterNextRender(() => {
      this.lockScroll();
      this.host.focus({ preventScroll: true });
      this.buildTiles();
      this.zone.runOutsideAngular(() => this.load());
    });

    inject(DestroyRef).onDestroy(() => {
      clearInterval(this.loadingTimer);
      this.timers.forEach((timer) => clearTimeout(timer));
      this.unlockScroll();
    });
  }

  protected start(): void {
    if (this.phase() !== 'menu') {
      return;
    }

    this.sound.play('start');

    if (this.motion.reducedMotion()) {
      this.close();
      return;
    }

    this.phase.set('starting');
    this.later(() => this.leave(), STARTING_MS);
  }

  protected skip(): void {
    if (this.phase() === 'leaving') {
      return;
    }

    this.sound.play('back');

    if (this.motion.reducedMotion()) {
      this.close();
    } else {
      this.leave();
    }
  }

  protected setLang(lang: Lang): void {
    if (lang !== this.i18n.lang()) {
      this.i18n.setLang(lang);
      this.sound.play('select');
    }
  }

  protected setSound(on: boolean): void {
    if (on === this.sound.enabled()) {
      return;
    }

    this.sound.setEnabled(on);
    this.sound.play('select');
  }

  protected onKeydown(event: KeyboardEvent): void {
    const inMenu = this.phase() === 'menu';

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.skip();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (inMenu) {
          event.preventDefault();
          this.moveRow(event.key === 'ArrowDown' ? 1 : -1);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (inMenu) {
          event.preventDefault();
          this.changeSetting(event.key === 'ArrowRight' ? 1 : -1);
        }
        break;
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  /**
   * Fills the bar while waiting for the fonts and the hero's first frame: at least
   * MIN_LOADING_MS, at most MAX_LOADING_MS. Runs outside the Angular zone.
   */
  private load(): void {
    const startedAt = performance.now();
    let fontsReady = !document.fonts;

    document.fonts?.ready.then(
      () => (fontsReady = true),
      () => (fontsReady = true),
    );

    this.loadingTimer = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const heroReady = this.heroScene.ready();

      if ((fontsReady && heroReady && elapsed >= MIN_LOADING_MS) || elapsed >= MAX_LOADING_MS) {
        clearInterval(this.loadingTimer);
        this.percent.set(100);
        this.later(() => this.zone.run(() => this.showMenu()), 300);
        return;
      }

      // Time moves the bar steadily; each finished task adds a chunk. Never past 95% early.
      const estimate = (elapsed / MAX_LOADING_MS) * 60 + (fontsReady ? 15 : 0) + (heroReady ? 20 : 0);
      const stepped = Math.min(95, Math.floor(estimate / 5) * 5);
      this.percent.update((percent) => Math.max(percent, stepped));
    }, 50);
  }

  private showMenu(): void {
    if (this.phase() !== 'loading') {
      return;
    }

    this.phase.set('menu');
    afterNextRender(() => this.focusRow(0), { injector: this.injector });
  }

  private leave(): void {
    clearInterval(this.loadingTimer);
    this.phase.set('leaving');
    this.later(() => this.zone.run(() => this.close()), WIPE_SPREAD_MS + TILE_MS + 40);
  }

  private close(): void {
    clearInterval(this.loadingTimer);
    this.unlockScroll();
    this.intro.finish();
  }

  /** ↑/↓ between START, LANGUAGE and SOUND (focusing a row's current choice). */
  private moveRow(direction: 1 | -1): void {
    const current = Number((document.activeElement as HTMLElement | null)?.dataset['row'] ?? -1);
    const next = current === -1 ? 0 : (current + direction + 3) % 3;

    this.focusRow(next);
    this.sound.play('hover');
  }

  /** ←/→ on a selector row picks the previous / next choice. */
  private changeSetting(direction: 1 | -1): void {
    const row = (document.activeElement as HTMLElement | null)?.dataset['row'];

    if (row === '1') {
      const index = LANGS.indexOf(this.i18n.lang());
      this.setLang(LANGS[Math.min(Math.max(index + direction, 0), LANGS.length - 1)]);
    } else if (row === '2') {
      this.setSound(direction === 1);
    } else {
      return;
    }

    // The selected choice moved: keep focus on it.
    afterNextRender(() => this.focusRow(Number(row)), { injector: this.injector });
  }

  private focusRow(row: number): void {
    const buttons = Array.from(
      this.host.querySelectorAll<HTMLButtonElement>(`button[data-row="${row}"]`),
    );
    const target = buttons.find((button) => button.getAttribute('aria-pressed') === 'true');

    (target ?? buttons[0])?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = Array.from(this.host.querySelectorAll<HTMLElement>('button:not([disabled])'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === this.host)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (active === last || !this.host.contains(active))) {
      event.preventDefault();
      first?.focus();
    }
  }

  /** Square-ish tiles (about 14 along the long side) that dissolve diagonally on the way out. */
  private buildTiles(): void {
    const size = Math.max(window.innerWidth, window.innerHeight) / 14;
    const columns = Math.ceil(window.innerWidth / size);
    const rows = Math.ceil(window.innerHeight / size);
    const spread = columns + rows - 2 || 1;

    this.columns.set(columns);
    this.rows.set(rows);
    this.tiles.set(
      Array.from({ length: columns * rows }, (_, id) => ({
        id,
        delay: Math.round(((id % columns) + Math.floor(id / columns)) * (WIPE_SPREAD_MS / spread)),
      })),
    );
  }

  private lockScroll(): void {
    this.smoothScroll.init();
    this.smoothScroll.stop();
    document.body.style.overflow = 'hidden';
    this.scrollLocked = true;
  }

  private unlockScroll(): void {
    if (!this.scrollLocked) {
      return;
    }

    this.scrollLocked = false;
    document.body.style.removeProperty('overflow');
    this.smoothScroll.start();
  }

  private later(callback: () => void, ms: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, ms);
    this.timers.add(timer);
  }
}
