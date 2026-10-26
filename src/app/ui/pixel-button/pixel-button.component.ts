import { Component, ElementRef, booleanAttribute, inject, input } from '@angular/core';

export type PixelButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Pixel-style button for `<button>` and `<a>`: `<button pixelButton="secondary">`.
 * Variants: primary (coin, default), secondary (paper), ghost (transparent, inherits color).
 * `disabled` sets the native attribute on buttons, and aria-disabled + no tab stop on links.
 */
@Component({
  selector: 'button[pixelButton], a[pixelButton]',
  template: `<ng-content />`,
  styleUrl: './pixel-button.component.scss',
  host: {
    '[class.pixel-button--secondary]': 'variant() === "secondary"',
    '[class.pixel-button--ghost]': 'variant() === "ghost"',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[attr.tabindex]': '!isButton && disabled() ? -1 : null',
    '(click)': 'onClick($event)',
  },
})
export class PixelButtonComponent {
  readonly variant = input('primary', {
    alias: 'pixelButton',
    transform: (value: PixelButtonVariant | '') => value || 'primary',
  });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
