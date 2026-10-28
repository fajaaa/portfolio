import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

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
 * drift by that many yPercent while the world scrolls past: a CSS scroll-driven animation on
 * the `--world` view timeline declared here (see art/_base.scss). Ambient CSS loops pause
 * off-screen and under reduced motion (which also turns parallax off).
 */
@Component({
  selector: 'app-world-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private observer: IntersectionObserver | undefined;

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.pauseWhenOffscreen()));
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  private pauseWhenOffscreen(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => this.host.classList.toggle('is-idle', !entry.isIntersecting),
      { rootMargin: '120px 0px' },
    );
    this.observer.observe(this.host);
  }
}
