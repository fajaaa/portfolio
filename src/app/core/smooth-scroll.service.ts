import { Injectable, NgZone, effect, inject, untracked } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { MotionService } from './motion.service';

/** Height of the fixed HUD; pass `-HUD_OFFSET` as `offset` to land sections below it. */
export const HUD_OFFSET = 84;

export type ScrollTarget = number | string | HTMLElement;

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

  private readonly onTick = (time: number) => this.lenis?.raf(time * 1000);

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

    if (!this.motion.reducedMotion()) {
      this.createLenis();
    }

    // Async content (e.g. GitHub projects) changes the page height; keep trigger positions fresh.
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
      });
      this.resizeObserver.observe(document.body);
    });
  }

  scrollTo(target: ScrollTarget, { offset = 0, immediate = false }: ScrollToOptions = {}): void {
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

  private resolveTop(target: ScrollTarget): number | null {
    if (typeof target === 'number') {
      return target;
    }

    const element = typeof target === 'string' ? document.querySelector(target) : target;
    return element ? element.getBoundingClientRect().top + window.scrollY : null;
  }
}
