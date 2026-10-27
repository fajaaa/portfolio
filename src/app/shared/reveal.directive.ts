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
import { SmoothScrollService } from '../core/smooth-scroll.service';

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

/**
 * Plays a one-time entrance animation when the element scrolls into view.
 *
 * `<div reveal="pixel" [delay]="200">` animates the host; with `[stagger]="120"` the host's
 * children animate one after another instead. Delay and stagger are in ms.
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
  private stopFocusListener: (() => void) | undefined;

  constructor() {
    // Ensures ScrollTrigger is registered before any trigger is created.
    inject(SmoothScrollService);

    afterNextRender(() => {
      if (this.motion.reducedMotion()) {
        this.revealed.emit();
        return;
      }

      this.zone.runOutsideAngular(() => this.animate());
    });

    // If reduced motion turns on before the element was revealed, show it right away.
    effect(() => {
      if (this.motion.reducedMotion()) {
        untracked(() => {
          this.stopFocusListener?.();
          this.context?.revert();
        });
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.stopFocusListener?.();
      this.context?.revert();
    });
  }

  private animate(): void {
    const variant = VARIANTS[this.reveal()];
    const stagger = Math.max(this.stagger(), 0) / 1000;
    const targets = stagger > 0 ? Array.from(this.host.children) : this.host;

    this.context = gsap.context(() => {
      const tween = gsap.fromTo(targets, variant.from, {
        ...variant.to,
        delay: Math.max(this.delay(), 0) / 1000,
        stagger,
        scrollTrigger: { trigger: this.host, start: 'top 85%', once: true },
        onStart: () => this.zone.run(() => this.revealed.emit()),
      });

      // Keyboard focus can land here before the entrance played: finish it at once.
      const showNow = () => tween.progress(1);
      this.host.addEventListener('focusin', showNow, { once: true });
      this.stopFocusListener = () => this.host.removeEventListener('focusin', showNow);
    }, this.host);
  }
}
