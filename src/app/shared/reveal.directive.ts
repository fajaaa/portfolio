import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  untracked,
} from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../core/motion.service';

export type RevealVariant = 'up' | 'pop' | 'pixel';

interface RevealTween {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

const FADE_CLEAR = 'transform,opacity';

// Opacity, not autoAlpha: `visibility: hidden` would take not-yet-revealed content out of the
// tab order and the accessibility tree.
const VARIANTS: Record<RevealVariant, RevealTween> = {
  up: {
    from: { opacity: 0, y: 24 },
    to: { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: FADE_CLEAR },
  },
  pop: {
    from: { opacity: 0, scale: 0.85 },
    to: { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)', clearProps: FADE_CLEAR },
  },
  // Stepped left-to-right wipe.
  pixel: {
    from: { clipPath: 'inset(0% 100% 0% 0%)' },
    to: { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'steps(8)', clearProps: 'clipPath' },
  },
};

/** The entrance starts once the element's top is 15% above the bottom of the viewport. */
const REVEAL_ROOT_MARGIN = '0px 0px -15% 0px';

/**
 * Plays a one-time entrance animation when the element scrolls into view.
 *
 * `<div reveal="pixel" [delay]="200">` animates the host; with `[stagger]="120"` the host's
 * children animate one after another instead. Delay and stagger are in ms.
 * Watched with an IntersectionObserver (no per-frame scroll work); an element that is already
 * above the viewport (deep link, restored scroll) plays right away.
 * Does nothing under reduced motion (`revealed` still emits so dependent logic runs).
 */
@Directive({ selector: '[reveal]' })
export class RevealDirective {
  readonly reveal = input('up', { transform: (value: RevealVariant | '') => value || 'up' });
  readonly delay = input(0, { transform: numberAttribute });
  readonly stagger = input(0, { transform: numberAttribute });
  readonly revealed = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private context: gsap.Context | undefined;
  private observer: IntersectionObserver | undefined;
  private played = false;
  private stopFocusListener: (() => void) | undefined;

  constructor() {
    afterNextRender(() => {
      if (this.motion.reducedMotion()) {
        this.revealed.emit();
        return;
      }

      this.zone.runOutsideAngular(() => this.prepare());
    });

    // If reduced motion turns on before the element was revealed, show it right away.
    effect(() => {
      if (this.motion.reducedMotion()) {
        untracked(() => this.cleanUp());
      }
    });

    inject(DestroyRef).onDestroy(() => this.cleanUp());
  }

  /** Hides the targets in their "from" state and waits for the host to scroll into view. */
  private prepare(): void {
    const variant = VARIANTS[this.reveal()];
    const targets = this.stagger() > 0 ? Array.from(this.host.children) : this.host;

    this.context = gsap.context(() => gsap.set(targets, variant.from), this.host);

    // Keyboard focus can land here before the entrance played: show it at once.
    const showNow = () => this.play(true);
    this.host.addEventListener('focusin', showNow, { once: true });
    this.stopFocusListener = () => this.host.removeEventListener('focusin', showNow);

    if (typeof IntersectionObserver === 'undefined') {
      this.play(true);
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        const above = entry.boundingClientRect.bottom < 0;

        if (entry.isIntersecting || above) {
          this.play(above);
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    );
    this.observer.observe(this.host);
  }

  /** Runs the entrance once; `instantly` jumps to the end (already scrolled past, or focused). */
  private play(instantly: boolean): void {
    if (!this.context || this.played) {
      return;
    }

    this.played = true;
    this.observer?.disconnect();
    this.stopFocusListener?.();

    const variant = VARIANTS[this.reveal()];
    const stagger = Math.max(this.stagger(), 0) / 1000;
    const targets = stagger > 0 ? Array.from(this.host.children) : this.host;

    this.context.add(() => {
      const tween = gsap.to(targets, {
        ...variant.to,
        delay: Math.max(this.delay(), 0) / 1000,
        stagger,
        onStart: () => this.zone.run(() => this.revealed.emit()),
      });

      if (instantly) {
        tween.progress(1);
      }
    });
  }

  private cleanUp(): void {
    this.observer?.disconnect();
    this.stopFocusListener?.();
    this.context?.revert();
    this.context = undefined;
  }
}
