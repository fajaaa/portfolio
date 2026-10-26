import { Injectable, NgZone, effect, inject, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { MotionService } from './motion.service';

/** Height of the fixed HUD; pass `-HUD_OFFSET` as `offset` to land sections below it. */
export const HUD_OFFSET = 84;

export type ScrollTarget = number | string | HTMLElement;

export interface ScrollState {
  /** Current scroll position in px. */
  y: number;
  /** 1 = down, -1 = up, 0 = unchanged. */
  direction: 1 | -1 | 0;
}

export type ScrollListener = (state: ScrollState) => void;

/** A programmatic scroll counts as finished once no scroll event arrived for this long. */
const AUTO_SCROLL_IDLE_MS = 200;

export interface ScrollToOptions {
  /** Pixels added to the target position (negative = stop above the target). */
  offset?: number;
  /** Jump without animating. */
  immediate?: boolean;
}

/**
 * Owns page scrolling: Lenis smooth scroll driven by the GSAP ticker, with ScrollTrigger
 * kept in sync. Falls back to native scrolling while reduced motion is on.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private lenis: Lenis | null = null;
  private initialized = false;
  private resizeObserver: ResizeObserver | undefined;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;
  private autoScrollTimer: ReturnType<typeof setTimeout> | undefined;
  private autoScrolling = false;
  private lastY = 0;
  private readonly listeners = new Set<ScrollListener>();

  private readonly onTick = (time: number) => this.lenis?.raf(time * 1000);
  private readonly onLenisScroll = (lenis: Lenis) => this.emit(lenis.scroll);
  // Native scroll events only drive listeners while Lenis is off (reduced motion).
  private readonly onNativeScroll = () => {
    if (!this.lenis) {
      this.emit(window.scrollY);
    }
  };

  constructor() {
    gsap.registerPlugin(ScrollTrigger);

    effect(() => {
      const reduced = this.motion.reducedMotion();

      untracked(() => {
        if (!this.initialized) {
          return;
        }

        if (reduced) {
          this.destroyLenis();
        } else {
          this.createLenis();
        }
      });
    });
  }

  /** Starts smooth scrolling. Safe to call more than once; call it from `afterNextRender`. */
  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.lastY = window.scrollY;

    if (!this.motion.reducedMotion()) {
      this.createLenis();
    }

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onNativeScroll, { passive: true });

      // Async content (e.g. GitHub projects) changes the page height; keep trigger positions fresh.
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      this.resizeObserver.observe(document.body);
    });
  }

  /**
   * Calls `listener` on every scroll frame (Lenis scroll events, or native ones under reduced
   * motion), outside the Angular zone. Returns a function that removes the listener.
   */
  onScroll(listener: ScrollListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** True while a `scrollTo()` is still moving the page (e.g. after a nav link click). */
  get isAutoScrolling(): boolean {
    return this.autoScrolling;
  }

  scrollTo(target: ScrollTarget, { offset = 0, immediate = false }: ScrollToOptions = {}): void {
    this.autoScrolling = true;
    this.armAutoScrollTimer();

    if (this.lenis) {
      this.lenis.scrollTo(target, { offset, immediate });
      return;
    }

    const top = this.resolveTop(target);

    if (top !== null) {
      const smooth = !immediate && !this.motion.reducedMotion();
      window.scrollTo({ top: top + offset, behavior: smooth ? 'smooth' : 'instant' });
    }
  }

  /** Locks page scrolling (e.g. while a modal is open). */
  stop(): void {
    if (this.lenis) {
      this.lenis.stop();
    } else {
      document.documentElement.style.overflow = 'hidden';
    }
  }

  start(): void {
    this.lenis?.start();
    document.documentElement.style.removeProperty('overflow');
  }

  private createLenis(): void {
    if (this.lenis) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.lenis = new Lenis({ autoRaf: false });
      this.lenis.on('scroll', ScrollTrigger.update);
      this.lenis.on('scroll', this.onLenisScroll);
      gsap.ticker.add(this.onTick);
      gsap.ticker.lagSmoothing(0);
    });
  }

  private destroyLenis(): void {
    if (!this.lenis) {
      return;
    }

    gsap.ticker.remove(this.onTick);
    gsap.ticker.lagSmoothing(500, 33);
    this.lenis.destroy();
    this.lenis = null;
  }

  private emit(y: number): void {
    const direction = y > this.lastY ? 1 : y < this.lastY ? -1 : 0;
    this.lastY = y;

    // Each frame of a running scrollTo() pushes its end further out.
    if (this.autoScrolling) {
      this.armAutoScrollTimer();
    }

    this.listeners.forEach((listener) => listener({ y, direction }));
  }

  private armAutoScrollTimer(): void {
    clearTimeout(this.autoScrollTimer);
    this.zone.runOutsideAngular(() => {
      this.autoScrollTimer = setTimeout(() => (this.autoScrolling = false), AUTO_SCROLL_IDLE_MS);
    });
  }

  private resolveTop(target: ScrollTarget): number | null {
    if (typeof target === 'number') {
      return target;
    }

    const element = typeof target === 'string' ? document.querySelector(target) : target;
    return element ? element.getBoundingClientRect().top + window.scrollY : null;
  }
}
