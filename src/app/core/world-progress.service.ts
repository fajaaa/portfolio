import { Injectable, NgZone, computed, inject, signal } from '@angular/core';

import { HUD_OFFSET, SmoothScrollService } from './smooth-scroll.service';
import { SoundService } from './sound.service';
import { WORLDS } from './worlds';

/** Inputs that mean the user is scrolling by hand (as opposed to deep links or restores). */
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;

/** No level-up cue this long after the worlds appear (page load, anchor jump from another route). */
const QUIET_AFTER_LOAD_MS = 1500;

/** Section positions in page coordinates, measured only when the layout changes. */
interface Geometry {
  readonly tops: readonly number[];
  readonly bottom: number;
  readonly maxScroll: number;
  readonly viewport: number;
}

/**
 * Tracks which world (section) is active and how far through the page the player is.
 *
 * A probe line moves from the top of the viewport (page top) to its bottom (page end); the
 * world under it is active and `progress` is (worlds passed + fraction of the current one) / 5,
 * so the 5 XP bar segments line up with the worlds. `levelUps` counts new worlds reached by
 * scrolling down (not on load, deep links or nav link jumps); the HUD flashes on it.
 *
 * Scrolling only does arithmetic: the section positions are measured once and re-measured when
 * a section resizes, the window resizes or the fonts arrive, so no scroll frame forces
 * a layout.
 */
@Injectable({ providedIn: 'root' })
export class WorldProgressService {
  private readonly zone = inject(NgZone);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly sound = inject(SoundService);
  private readonly index = signal(0);
  private readonly ratio = signal(0);
  private readonly found = signal(false);
  private readonly ups = signal(0);
  private geometry: Geometry | null = null;
  private observed: readonly HTMLElement[] = [];
  private resizeObserver: ResizeObserver | undefined;
  private userScrolled = false;
  private quietUntil = 0;
  private frame: number | undefined;

  readonly world = computed(() => WORLDS[this.index()]);
  readonly level = computed(() => this.index() + 1);
  /** 0–1 through the whole page. */
  readonly progress = this.ratio.asReadonly();
  /** False on pages without the worlds (e.g. 404). */
  readonly hasWorlds = this.found.asReadonly();
  /** Goes up by one each time the player scrolls into a new world. */
  readonly levelUps = this.ups.asReadonly();

  private readonly markUserScroll = () => {
    this.userScrolled = true;
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, this.markUserScroll));
  };

  /** Starts tracking; call from `afterNextRender`. Returns a function that stops it. */
  connect(): () => void {
    const remeasure = () => this.refresh();

    return this.zone.runOutsideAngular(() => {
      const stopScroll = this.smoothScroll.onScroll(({ y }) => this.update(y));
      USER_SCROLL_EVENTS.forEach((type) =>
        window.addEventListener(type, this.markUserScroll, { passive: true }),
      );
      window.addEventListener('resize', remeasure);
      // The pixel fonts change text metrics (and so section positions) once they arrive.
      document.fonts?.ready.then(remeasure);
      this.resizeObserver =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(remeasure);
      this.refresh();

      return () => {
        stopScroll();
        this.markUserScroll();
        window.removeEventListener('resize', remeasure);
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
        this.observed = [];
        this.geometry = null;
        cancelAnimationFrame(this.frame ?? 0);
      };
    });
  }

  /** Re-measures after the next layout, e.g. once a route rendered its sections. */
  refresh(): void {
    cancelAnimationFrame(this.frame ?? 0);
    this.zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = requestAnimationFrame(() => {
          this.measure();
          this.update(window.scrollY);
        });
      });
    });
  }

  private measure(): void {
    const sections = WORLDS.map(({ section }) => document.getElementById(section));

    if (sections.some((section) => !section)) {
      this.geometry = null;
      this.observe([]);
      return;
    }

    const elements = sections as HTMLElement[];
    const y = window.scrollY;
    const rects = elements.map((section) => section.getBoundingClientRect());
    const viewport = window.innerHeight;

    this.geometry = {
      tops: rects.map((rect) => rect.top + y),
      bottom: rects[rects.length - 1].bottom + y,
      maxScroll: Math.max(document.documentElement.scrollHeight - viewport, 1),
      viewport,
    };
    this.observe(elements);
  }

  /** Watches the sections' sizes (content loading in, fonts, images) to re-measure. */
  private observe(sections: readonly HTMLElement[]): void {
    const same =
      sections.length === this.observed.length &&
      sections.every((section, i) => section === this.observed[i]);

    if (same || !this.resizeObserver) {
      return;
    }

    this.resizeObserver.disconnect();
    sections.forEach((section) => this.resizeObserver!.observe(section));
    this.observed = sections;
  }

  private update(y: number): void {
    if (!this.geometry) {
      this.measure();
    }

    const geometry = this.geometry;

    if (!geometry) {
      this.found.set(false);
      return;
    }

    const { tops, bottom, maxScroll, viewport } = geometry;
    const pageRatio = clamp(y / maxScroll);
    // Starts at 0 on the page top, then stays clear of the HUD.
    const hud = HUD_OFFSET * clamp(y / HUD_OFFSET);
    const probe = y + hud + (viewport - hud) * pageRatio;
    const last = tops.length - 1;

    let index = 0;
    tops.forEach((top, i) => {
      if (top <= probe) {
        index = i;
      }
    });

    const end = index < last ? tops[index + 1] : bottom;
    const fraction = clamp((probe - tops[index]) / Math.max(end - tops[index], 1));
    const previous = this.index();

    if (!this.found()) {
      this.quietUntil = performance.now() + QUIET_AFTER_LOAD_MS;
    }

    this.found.set(true);
    // Whole percents: finer than the 40-segment bar needs, and every change re-renders the HUD.
    this.ratio.set(Math.round(((index + fraction) / WORLDS.length) * 100) / 100);
    this.index.set(index);

    const quiet = performance.now() < this.quietUntil || this.smoothScroll.isAutoScrolling;

    if (index > previous && this.userScrolled && !quiet) {
      this.sound.play('coin');
      this.ups.update((count) => count + 1);
    }
  }
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}
