import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { SectionId, WORLDS, WorldId } from '../../core/worlds';
import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { WorldBackgroundComponent } from '../world-background/world-background.component';

/**
 * Frames a page section as a game world: pixel backdrop, a "WORLD 1-x · NAME" plate and the
 * projected content. The host carries the section `id` (the scroll / nav target). Every world
 * after the first starts with a stepped edge in the previous world's floor colour.
 *
 * The first time the plate scrolls into view from below, it plays a stage intro: a stepped wipe,
 * a flashing world number and a short "START!" tag (CSS only, skipped under reduced motion).
 * Not on load, and not during nav link jumps.
 *
 * While the world is off screen its host gets `.world--offscreen`, which pauses every CSS
 * animation inside it (see styles.scss): Chrome restyles running animations on each frame the
 * page renders, so loops in worlds nobody sees would otherwise slow down scrolling elsewhere.
 */
@Component({
  selector: 'app-world-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, WorldBackgroundComponent],
  template: `
    <app-world-background [world]="world()" />

    <div class="world__inner">
      <div #plateRow class="world__plate-row">
        <div class="world__plate-anchor" [class.world__plate-anchor--enter]="entered()">
          <p class="world__plate">
            <span class="world__plate-id">{{ 'hud.world' | t: { world: world() } }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ labelKey() | t }}</span>
          </p>
          @if (entered()) {
            <span class="world__start" aria-hidden="true">START!</span>
          }
        </div>
      </div>

      <ng-content />
    </div>

    @if (!isFirst()) {
      <div class="world__edge" aria-hidden="true"></div>
    }
  `,
  styleUrl: './world-section.component.scss',
  host: {
    '[attr.id]': 'id()',
    '[attr.data-world]': 'world()',
  },
})
export class WorldSectionComponent {
  readonly id = input.required<SectionId>();
  readonly world = input.required<WorldId>();
  readonly labelKey = input.required<I18nKey>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly plateRow = viewChild.required<ElementRef<HTMLElement>>('plateRow');

  protected readonly isFirst = computed(() => this.world() === WORLDS[0].id);
  /** Set once the player scrolled down to this world's plate: plays the stage intro. */
  protected readonly entered = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        return;
      }

      const visibility = this.zone.runOutsideAngular(
        () =>
          new IntersectionObserver(
            ([entry]) => this.host.classList.toggle('world--offscreen', !entry.isIntersecting),
            { rootMargin: '200px 0px' },
          ),
      );
      visibility.observe(this.host);
      destroyRef.onDestroy(() => visibility.disconnect());

      if (this.isFirst()) {
        return;
      }

      // The first callback reports the state on load: never an entrance.
      let initial = true;
      const observer = new IntersectionObserver(
        ([entry]) => {
          const viewport = entry.rootBounds?.height ?? window.innerHeight;
          const fromBelow = entry.boundingClientRect.top > viewport / 2;

          if (!initial && entry.isIntersecting && fromBelow && !this.smoothScroll.isAutoScrolling) {
            this.entered.set(true);
            observer.disconnect();
          }

          initial = false;
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 1 },
      );

      observer.observe(this.plateRow().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
