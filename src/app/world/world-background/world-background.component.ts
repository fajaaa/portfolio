import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/motion.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { WorldId } from '../../core/worlds';
import {
  CastleArtComponent,
  CaveArtComponent,
  ForestArtComponent,
  SkyArtComponent,
  WaterArtComponent,
} from './art/world-art';

/**
 * Pixel-art backdrop of a world (layers in ./art, 2–3 each). Layers with `data-parallax`
 * drift by that many yPercent while the world scrolls past. Ambient CSS loops pause off-screen
 * and under reduced motion (which also turns parallax off).
 */
@Component({
  selector: 'app-world-background',
  imports: [SkyArtComponent, ForestArtComponent, CaveArtComponent, WaterArtComponent, CastleArtComponent],
  templateUrl: './world-background.component.html',
  styleUrl: './world-background.component.scss',
  host: {
    'aria-hidden': 'true',
    '[attr.data-world]': 'world()',
  },
})
export class WorldBackgroundComponent {
  readonly world = input.required<WorldId>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private context: gsap.Context | undefined;
  private observer: IntersectionObserver | undefined;

  constructor() {
    // Ensures ScrollTrigger is registered before any trigger is created.
    inject(SmoothScrollService);

    const rendered = signal(false);
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => this.pauseWhenOffscreen());
      rendered.set(true);
    });

    effect(() => {
      if (!rendered()) {
        return;
      }

      const reduced = this.motion.reducedMotion();
      untracked(() => {
        this.context?.revert();
        this.context = undefined;

        if (!reduced) {
          this.zone.runOutsideAngular(() => this.startParallax());
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.context?.revert();
      this.observer?.disconnect();
    });
  }

  private startParallax(): void {
    const layers = Array.from(this.host.querySelectorAll<HTMLElement>('[data-parallax]'));

    this.context = gsap.context(() => {
      for (const layer of layers) {
        const depth = Number(layer.dataset['parallax']) || 0;

        gsap.fromTo(
          layer,
          { yPercent: -depth },
          {
            yPercent: depth,
            ease: 'none',
            scrollTrigger: { trigger: this.host, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }
    }, this.host);
  }

  private pauseWhenOffscreen(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => this.host.classList.toggle('is-idle', !entry.isIntersecting),
      { rootMargin: '120px 0px' },
    );
    this.observer.observe(this.host);
  }
}
