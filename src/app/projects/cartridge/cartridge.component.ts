import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';

import { MotionService } from '../../core/motion.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { PixelTagComponent } from '../../ui/pixel-tag/pixel-tag.component';
import { coverFor } from '../covers/covers';
import { Project } from '../projects.service';

interface PlasticColor {
  body: string;
  /** Text printed on the plastic (the LV number). */
  text: string;
}

/** Cartridge plastics, picked by position so neighbours differ. */
const PLASTICS: readonly PlasticColor[] = [
  { body: 'var(--paper-muted)', text: 'var(--ink)' },
  { body: 'var(--w13-bricks)', text: 'var(--paper)' },
  { body: 'var(--w14-deep)', text: 'var(--paper)' },
  { body: 'var(--w12-mid)', text: 'var(--paper)' },
  { body: 'var(--hp)', text: 'var(--ink)' },
  { body: 'var(--w15-stone)', text: 'var(--paper)' },
];

const MAX_TAGS = 3;
const INSERT_MS = 260;

/**
 * A project as an SNES-style cartridge: one big button with the cover on its label sticker.
 * `selected` emits on click / Enter / Space; the parent then calls `insert()` (slide-down
 * animation) and later `eject()` to bring it back and focus it.
 */
@Component({
  selector: 'app-cartridge',
  imports: [PixelArtComponent, PixelTagComponent, TranslatePipe],
  templateUrl: './cartridge.component.html',
  styleUrl: './cartridge.component.scss',
  host: {
    '[style.--cart-body]': 'plastic().body',
    '[style.--cart-text]': 'plastic().text',
  },
})
export class CartridgeComponent {
  readonly project = input.required<Project>();
  readonly index = input(0, { transform: numberAttribute });
  readonly selected = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private animation: Animation | undefined;

  protected readonly cover = computed(() => coverFor(this.project().title));
  protected readonly plastic = computed(() => PLASTICS[this.index() % PLASTICS.length]);
  protected readonly level = computed(() => String(this.index() + 1).padStart(2, '0'));
  protected readonly tags = computed(() => this.project().techStack.slice(0, MAX_TAGS));
  protected readonly extraTags = computed(() => this.project().techStack.length - MAX_TAGS);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.animation?.cancel());
  }

  /** Slides the cartridge down "into the console" and fades it out. Instant under reduced motion. */
  insert(): Promise<void> {
    this.animation?.cancel();

    if (this.motion.reducedMotion() || typeof this.host.animate !== 'function') {
      return Promise.resolve();
    }

    this.animation = this.host.animate(
      [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(18%)', opacity: 0 },
      ],
      { duration: INSERT_MS, easing: 'steps(5, end)', fill: 'forwards' },
    );

    return this.animation.finished.then(
      () => undefined,
      () => undefined,
    );
  }

  /** Brings the cartridge back (reversing the insert) and focuses it. */
  eject(): void {
    const animation = this.animation;

    if (animation && !this.motion.reducedMotion()) {
      animation.reverse();
      animation.finished.then(
        () => animation.cancel(),
        () => undefined,
      );
    } else {
      animation?.cancel();
    }

    this.button().nativeElement.focus({ preventScroll: true });
  }
}
