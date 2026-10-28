import { Injectable, signal } from '@angular/core';

/** Tracks the user's `prefers-reduced-motion` setting and updates live when it changes. */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly reduced = signal(false);

  readonly reducedMotion = this.reduced.asReadonly();

  constructor() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.set(query.matches);
    query.addEventListener('change', (event) => this.reduced.set(event.matches));
  }
}
