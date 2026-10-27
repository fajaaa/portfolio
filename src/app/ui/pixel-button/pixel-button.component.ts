import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

import { SoundService } from '../../core/sound.service';

export type PixelButtonVariant = 'primary' | 'secondary' | 'ghost';
export type PixelButtonSound = 'select' | 'back' | 'none';

/**
 * Pixel-style button for `<button>` and `<a>`: `<button pixelButton="secondary">`.
 * Variants: primary (coin, default), secondary (paper), ghost (transparent, inherits color).
 * `disabled` sets the native attribute on buttons, and aria-disabled + no tab stop on links.
 * Plays a hover blip and, on click, the `sound` effect ("select" by default; "back" for
 * cancel / close actions, "none" when the click handler plays its own).
 */
@Component({
  selector: 'button[pixelButton], a[pixelButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './pixel-button.component.scss',
  host: {
    '[class.pixel-button--secondary]': 'variant() === "secondary"',
    '[class.pixel-button--ghost]': 'variant() === "ghost"',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
    '(pointerenter)': 'onPointerEnter($event)',
    '(click)': 'onClick($event)',
  },
})
export class PixelButtonComponent {
  readonly variant = input('primary', {
    alias: 'pixelButton',
    transform: (value: PixelButtonVariant | '') => value || 'primary',
  });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly sound = input<PixelButtonSound>('select');

  private readonly sounds = inject(SoundService);

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onPointerEnter(event: Event): void {
    if (!this.disabled()) {
      this.sounds.hover(event);
    }
  }

  protected onClick(event: Event): void {
    const sound = this.sound();

    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (sound !== 'none') {
      this.sounds.play(sound);
    }
  }
}
