import {
  Component,
  ElementRef,
  NgZone,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  untracked,
} from '@angular/core';

import { MotionService } from '../../core/motion.service';
import { PixelPanelComponent } from '../pixel-panel/pixel-panel.component';

/**
 * RPG dialog box: paper panel, optional `speaker` name tag and a blinking ▼ when the text is done.
 *
 * With `typewriter` the `text` is typed out at `speed` ms per character, optionally waiting until
 * the box is on screen (`startWhenVisible`). Clicking skips to the end; reduced motion shows the
 * text at once. Screen readers always get the full text. `done` emits once the text is complete.
 * Projected content (e.g. answer buttons) renders below the text.
 */
@Component({
  selector: 'app-dialog-box',
  imports: [PixelPanelComponent],
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.scss',
  host: {
    '[class.dialog-box--typing]': '!finished()',
    '[class.dialog-box--with-speaker]': '!!speaker()',
    '(click)': 'skip()',
  },
})
export class DialogBoxComponent {
  readonly text = input.required<string>();
  readonly speaker = input<string>();
  readonly typewriter = input(false, { transform: booleanAttribute });
  readonly speed = input(30, { transform: numberAttribute });
  readonly startWhenVisible = input(false, { transform: booleanAttribute });
  readonly done = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private timer: ReturnType<typeof setInterval> | undefined;

  private readonly animated = computed(() => this.typewriter() && !this.motion.reducedMotion());

  /** Number of characters shown; resets whenever the text or mode changes. */
  private readonly shown = linkedSignal(() => (this.animated() ? 0 : this.text().length));

  protected readonly typed = computed(() => this.text().slice(0, this.shown()));
  protected readonly pending = computed(() => this.text().slice(this.shown()));
  protected readonly finished = computed(() => this.shown() >= this.text().length);

  constructor() {
    afterRenderEffect((onCleanup) => {
      const text = this.text();
      const animated = this.animated();
      const speed = Math.max(this.speed(), 1);
      const waitForView = this.startWhenVisible();

      untracked(() => {
        if (!animated || !text) {
          // Deferred so `done` handlers don't run in the middle of rendering.
          queueMicrotask(() => this.complete());
          return;
        }

        let observer: IntersectionObserver | undefined;

        this.zone.runOutsideAngular(() => {
          if (waitForView && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(
              ([entry]) => {
                if (entry?.isIntersecting) {
                  observer?.disconnect();
                  this.type(speed);
                }
              },
              { threshold: 0.5 },
            );
            observer.observe(this.host);
          } else {
            this.type(speed);
          }
        });

        onCleanup(() => {
          observer?.disconnect();
          clearInterval(this.timer);
        });
      });
    });
  }

  /** Shows the whole text immediately. */
  skip(): void {
    if (!this.finished()) {
      this.complete();
    }
  }

  private type(speed: number): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.shown.update((count) => count + 1);

      if (this.finished()) {
        this.complete();
      }
    }, speed);
  }

  private complete(): void {
    clearInterval(this.timer);
    this.shown.set(this.text().length);
    this.zone.run(() => this.done.emit());
  }
}
