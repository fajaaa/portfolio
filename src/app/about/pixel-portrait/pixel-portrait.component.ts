import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { MotionService } from '../../core/motion.service';

/** Resolution of the pixel version; CSS scales it up with `image-rendering: pixelated`. */
const SIZE = 64;
/** The dissolve clears (or redraws) blocks of CELL x CELL source pixels. */
const CELL = 4;
const GRID = SIZE / CELL;
const CELLS = GRID * GRID;
/** Number of visible dissolve steps and the time between them. */
const STEPS = 8;
const STEP_MS = 45;
/** Colour levels per channel, for a slightly posterized 16-bit look. */
const LEVELS = 8;

/**
 * Portrait that shows a 64x64 pixelated version of `src` and dissolves to the real photo
 * in stepped blocks: on mouse hover, keyboard focus, or a click / tap (which toggles it).
 * The real `<img>` (with `alt`) is always in the DOM underneath; the canvas is decorative.
 */
@Component({
  selector: 'app-pixel-portrait',
  templateUrl: './pixel-portrait.component.html',
  styleUrl: './pixel-portrait.component.scss',
})
export class PixelPortraitComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();
  /** Visually hidden text for the toggle, e.g. "Show real photo". */
  readonly toggleLabel = input.required<string>();

  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly photo = viewChild.required<ElementRef<HTMLImageElement>>('photo');

  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  /** Set by a click / tap; wins over hover and focus until the pointer or focus leaves. */
  private readonly override = signal<boolean | null>(null);

  private readonly ready = signal(false);
  protected readonly showPhoto = computed(
    () => this.override() ?? (this.hovered() || this.focused()),
  );

  private source: HTMLCanvasElement | undefined;
  private context: CanvasRenderingContext2D | null = null;
  /** Random order in which the blocks dissolve. */
  private readonly order = shuffle(Array.from({ length: CELLS }, (_, i) => i));
  /** Number of blocks currently cleared (0 = full pixel portrait, CELLS = real photo). */
  private cleared = 0;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    afterNextRender(() => {
      const photo = this.photo().nativeElement;

      if (photo.complete && photo.naturalWidth) {
        this.pixelate(photo);
      } else {
        photo.addEventListener('load', () => this.pixelate(photo), { once: true });
      }
    });

    effect(() => {
      const target = this.showPhoto() && this.ready() ? CELLS : 0;
      untracked(() => this.zone.runOutsideAngular(() => this.dissolveTo(target)));
    });

    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      this.hovered.set(true);
    }
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType !== 'touch') {
      this.hovered.set(false);
      this.override.set(null);
    }
  }

  protected onFocus(event: FocusEvent): void {
    // Only keyboard focus; a tap focuses the button too, but is handled by the click.
    this.focused.set((event.target as HTMLElement).matches(':focus-visible'));
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.override.set(null);
  }

  protected toggle(): void {
    this.override.set(!this.showPhoto());
  }

  /** Draws the photo (center-cropped) into the 64x64 source canvas, posterized. */
  private pixelate(photo: HTMLImageElement): void {
    const source = document.createElement('canvas');
    source.width = source.height = SIZE;
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    this.context = this.canvas().nativeElement.getContext('2d');

    if (!sourceContext || !this.context) {
      return;
    }

    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    sourceContext.imageSmoothingQuality = 'high';
    sourceContext.drawImage(
      photo,
      (photo.naturalWidth - side) / 2,
      (photo.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE,
    );

    try {
      const image = sourceContext.getImageData(0, 0, SIZE, SIZE);
      const step = 255 / (LEVELS - 1);

      for (let i = 0; i < image.data.length; i += 4) {
        for (let channel = 0; channel < 3; channel++) {
          image.data[i + channel] = Math.round(image.data[i + channel] / step) * step;
        }
      }

      sourceContext.putImageData(image, 0, 0);
    } catch {
      // A tainted canvas (cross-origin image) keeps the plain downscaled version.
    }

    this.source = source;
    this.cleared = this.showPhoto() ? CELLS : 0;
    this.draw();
    this.ready.set(true);
  }

  private dissolveTo(target: number): void {
    clearInterval(this.timer);

    if (!this.source || this.cleared === target) {
      return;
    }

    if (this.motion.reducedMotion()) {
      this.cleared = target;
      this.draw();
      return;
    }

    const perStep = Math.ceil(CELLS / STEPS);

    this.timer = setInterval(() => {
      this.cleared =
        target > this.cleared
          ? Math.min(this.cleared + perStep, target)
          : Math.max(this.cleared - perStep, target);
      this.draw();

      if (this.cleared === target) {
        clearInterval(this.timer);
      }
    }, STEP_MS);
  }

  /** Full pixel portrait minus the first `cleared` blocks of the dissolve order. */
  private draw(): void {
    const context = this.context;

    if (!context || !this.source) {
      return;
    }

    context.clearRect(0, 0, SIZE, SIZE);
    context.drawImage(this.source, 0, 0);

    for (let i = 0; i < this.cleared; i++) {
      const cell = this.order[i];
      context.clearRect((cell % GRID) * CELL, Math.floor(cell / GRID) * CELL, CELL, CELL);
    }
  }
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}
