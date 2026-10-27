import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'kf.introSeen';

/**
 * The PRESS START intro, shown on the first visit only (remembered in `kf.introSeen`).
 *
 * `introDone` says whether the page's entrance may play: false while the intro covers the page,
 * true once it has closed (or right away when it isn't shown). The hero holds its entrance
 * until then.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  private readonly show = signal(!this.seen());

  /** True while the intro overlay is open. */
  readonly visible = this.show.asReadonly();
  readonly introDone = signal(!this.show());

  /** Closes the intro for good and lets the page entrance play. */
  finish(): void {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage blocked: the intro just shows again next visit.
    }

    this.show.set(false);
    this.introDone.set(true);
  }

  private seen(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      // Without storage the intro would show on every visit; skip it instead.
      return true;
    }
  }
}
