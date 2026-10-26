import { Component, computed, input, linkedSignal, numberAttribute } from '@angular/core';

/** Delay between two segments filling (or emptying), in ms. */
const STEP_MS = 60;

/**
 * Segmented HP/XP-style bar. `value` is 0–1; changes fill or empty the segments one by one.
 * `color` accepts any CSS color (default `var(--xp)`); `label` names it for screen readers.
 * `groups` splits the segments into that many visually separated groups (e.g. one per level).
 */
@Component({
  selector: 'app-pixel-progress',
  template: `
    @for (segment of slots(); track segment) {
      <span
        class="pixel-progress__segment"
        [class.pixel-progress__segment--filled]="segment < state().filled"
        [class.pixel-progress__segment--group-start]="isGroupStart(segment)"
        [style.transition-delay.ms]="delayFor(segment)"
      ></span>
    }
  `,
  styleUrl: './pixel-progress.component.scss',
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-label]': 'label() || null',
    '[style.--progress-color]': 'color()',
  },
})
export class PixelProgressComponent {
  readonly value = input(0, { transform: numberAttribute });
  readonly segments = input(10, { transform: numberAttribute });
  readonly color = input('var(--xp)');
  readonly label = input<string>();
  readonly groups = input(1, { transform: numberAttribute });

  private readonly count = computed(() => Math.max(1, Math.round(this.segments() || 1)));
  private readonly ratio = computed(() => Math.min(Math.max(this.value() || 0, 0), 1));
  private readonly filled = computed(() => Math.round(this.ratio() * this.count()));

  protected readonly slots = computed(() => Array.from({ length: this.count() }, (_, i) => i));
  private readonly groupSize = computed(() => this.count() / Math.max(1, this.groups() || 1));

  protected readonly percent = computed(() => Math.round(this.ratio() * 100));
  protected readonly state = linkedSignal<number, { filled: number; previous: number }>({
    source: this.filled,
    computation: (filled, previous) => ({ filled, previous: previous?.value.filled ?? 0 }),
  });

  protected isGroupStart(index: number): boolean {
    return index > 0 && Number.isInteger(index / this.groupSize());
  }

  /** Segments between the old and new value change one after another. */
  protected delayFor(index: number): number {
    const { filled, previous } = this.state();

    if (filled > previous && index >= previous && index < filled) {
      return (index - previous) * STEP_MS;
    }

    if (filled < previous && index >= filled && index < previous) {
      return (previous - 1 - index) * STEP_MS;
    }

    return 0;
  }
}
