import { Injectable, NgZone, inject } from '@angular/core';

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

/** How long a deep-linked section (/#skills) is kept in place while the page above it loads. */
const ANCHOR_HOLD_MS = 4000;

/** Inputs that mean the user scrolls by hand, which ends the anchor hold. */
const USER_SCROLL_INPUTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

export interface ScrollToOptions {
  /** Pixels added to the target position (negative = stop above the target). */
  offset?: number;
  /** Jump without animating. */
  immediate?: boolean;
}

/**
 * Owns page scrolling on top of the browser's native scrolling, which runs on the compositor
 * thread and so stays smooth even while the main thread is busy. Adds scroll listeners
 * (outside the Angular zone), smooth `scrollTo()` with an "auto scrolling" flag, scroll locking
 * for modals, and keeps deep-linked sections in place while the page above them loads.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private initialized = false;
  private resizeObserver: ResizeObserver | undefined;
  private autoScrollTimer: ReturnType<typeof setTimeout> | undefined;
  private autoScrolling = false;
  private lastY = 0;
  private heldAnchor: string | null = null;
  private readonly listeners = new Set<ScrollListener>();

  private readonly releaseAnchor = () => {
    this.heldAnchor = null;
    USER_SCROLL_INPUTS.forEach((type) => window.removeEventListener(type, this.releaseAnchor));
  };

  private readonly onNativeScroll = () => this.emit(window.scrollY);

  /** Starts listening. Safe to call more than once; call it from `afterNextRender`. */
  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.lastY = window.scrollY;

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onNativeScroll, { passive: true });

      this.holdAnchor();

      // Async content (e.g. GitHub projects) changes the page height: keep a deep link in place.
      this.resizeObserver = new ResizeObserver(() => this.restoreAnchor());
      this.resizeObserver.observe(document.body);
    });
  }

  /**
   * Calls `listener` on every scroll event (about once per frame while scrolling), outside the
   * Angular zone. Returns a function that removes the listener.
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
    const top = this.resolveTop(target);

    if (top === null) {
      return;
    }

    this.autoScrolling = true;
    this.armAutoScrollTimer();

    const smooth = !immediate && !this.motion.reducedMotion();
    window.scrollTo({ top: top + offset, behavior: smooth ? 'smooth' : 'instant' });
  }

  /** Locks page scrolling (e.g. while a modal is open). */
  stop(): void {
    document.documentElement.style.overflow = 'hidden';
  }

  start(): void {
    document.documentElement.style.removeProperty('overflow');
  }

  /**
   * The router jumps to a deep link's section (/#skills) as soon as the page renders, but the
   * GitHub projects and fonts above it arrive later and push it down. Until the user scrolls
   * (or ANCHOR_HOLD_MS pass), every page resize puts the section back under the HUD.
   */
  private holdAnchor(): void {
    const id = decodeURIComponent(window.location.hash.slice(1));

    if (!id) {
      return;
    }

    this.heldAnchor = id;
    USER_SCROLL_INPUTS.forEach((type) =>
      window.addEventListener(type, this.releaseAnchor, { passive: true }),
    );
    setTimeout(this.releaseAnchor, ANCHOR_HOLD_MS);
  }

  private restoreAnchor(): void {
    const target = this.heldAnchor ? document.getElementById(this.heldAnchor) : null;

    if (target) {
      this.scrollTo(target, { offset: -HUD_OFFSET, immediate: true });
    }
  }

  private emit(y: number): void {
    const direction = y > this.lastY ? 1 : y < this.lastY ? -1 : 0;
    this.lastY = y;

    // Each scroll event of a running scrollTo() pushes its end further out.
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
