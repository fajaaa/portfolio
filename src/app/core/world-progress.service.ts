import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { I18nService } from './i18n.service';
import { HUD_OFFSET, SmoothScrollService } from './smooth-scroll.service';
import { ToastService } from './toast.service';
import { WORLDS } from './worlds';

/** Inputs that mean the user is scrolling by hand (as opposed to deep links or restores). */
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;

/** No toasts this long after the worlds appear (page load, anchor jump from another route). */
const QUIET_AFTER_LOAD_MS = 1500;

/**
 * Tracks which world (section) is active and how far through the page the player is.
 *
 * A probe line moves from the top of the viewport (page top) to its bottom (page end); the
 * world under it is active and `progress` is (worlds passed + fraction of the current one) / 5,
 * so the 5 XP bar segments line up with the worlds. Shows "LEVEL UP!" when a new world is
 * reached by scrolling down, but not on load, deep links or nav link jumps.
 */
@Injectable({ providedIn: 'root' })
export class WorldProgressService {
  private readonly zone = inject(NgZone);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly index = signal(0);
  private readonly ratio = signal(0);
  private readonly found = signal(false);
  private userScrolled = false;
  private quietUntil = 0;
  private frame: number | undefined;

  readonly world = computed(() => WORLDS[this.index()]);
  readonly level = computed(() => this.index() + 1);
  /** 0–1 through the whole page. */
  readonly progress = this.ratio.asReadonly();
  /** False on pages without the worlds (e.g. 404). */
  readonly hasWorlds = this.found.asReadonly();

  private readonly markUserScroll = () => {
    this.userScrolled = true;
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, this.markUserScroll));
  };

  /** Starts tracking; call from `afterNextRender`. Returns a function that stops it. */
  connect(): () => void {
    const update = () => this.update(window.scrollY);

    return this.zone.runOutsideAngular(() => {
      const stopScroll = this.smoothScroll.onScroll(({ y }) => this.update(y));
      USER_SCROLL_EVENTS.forEach((type) =>
        window.addEventListener(type, this.markUserScroll, { passive: true }),
      );
      ScrollTrigger.addEventListener('refresh', update);
      window.addEventListener('resize', update);
      this.refresh();

      return () => {
        stopScroll();
        this.markUserScroll();
        ScrollTrigger.removeEventListener('refresh', update);
        window.removeEventListener('resize', update);
        cancelAnimationFrame(this.frame ?? 0);
      };
    });
  }

  /** Re-measures after the next layout, e.g. once a route rendered its sections. */
  refresh(): void {
    cancelAnimationFrame(this.frame ?? 0);
    this.frame = requestAnimationFrame(() => {
      this.frame = requestAnimationFrame(() => this.update(window.scrollY));
    });
  }

  private update(y: number): void {
    const sections = WORLDS.map(({ section }) => document.getElementById(section));

    if (sections.some((section) => !section)) {
      this.found.set(false);
      return;
    }

    const viewport = window.innerHeight;
    const maxScroll = Math.max(document.documentElement.scrollHeight - viewport, 1);
    const pageRatio = clamp(y / maxScroll);
    // Starts at 0 on the page top, then stays clear of the HUD.
    const hud = HUD_OFFSET * clamp(y / HUD_OFFSET);
    const probe = y + hud + (viewport - hud) * pageRatio;
    const tops = sections.map((section) => section!.getBoundingClientRect().top + y);
    const last = sections.length - 1;

    let index = 0;
    tops.forEach((top, i) => {
      if (top <= probe) {
        index = i;
      }
    });

    const end = index < last ? tops[index + 1] : tops[last] + sections[last]!.offsetHeight;
    const fraction = clamp((probe - tops[index]) / Math.max(end - tops[index], 1));
    const previous = this.index();

    if (!this.found()) {
      this.quietUntil = performance.now() + QUIET_AFTER_LOAD_MS;
    }

    this.found.set(true);
    this.ratio.set(Math.round(((index + fraction) / WORLDS.length) * 400) / 400);
    this.index.set(index);

    const quiet = performance.now() < this.quietUntil || this.smoothScroll.isAutoScrolling;

    if (index > previous && this.userScrolled && !quiet) {
      this.announceLevelUp();
    }
  }

  private announceLevelUp(): void {
    const world = this.world();

    this.toast.show({
      key: 'level-up',
      title: this.i18n.t('hud.levelUp'),
      detail: `${this.i18n.t('hud.world', { world: world.id })} · ${this.i18n.t(world.labelKey)}`,
    });
  }
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
