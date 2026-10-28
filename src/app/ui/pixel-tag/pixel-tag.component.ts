import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PixelTagVariant = 'paper' | 'ink' | 'coin';

/** Small pixel-bordered label chip: `<app-pixel-tag variant="coin">Angular</app-pixel-tag>`. */
@Component({
  selector: 'app-pixel-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './pixel-tag.component.scss',
  host: {
    '[class.pixel-tag--ink]': 'variant() === "ink"',
    '[class.pixel-tag--coin]': 'variant() === "coin"',
  },
})
export class PixelTagComponent {
  readonly variant = input<PixelTagVariant>('paper');
}
