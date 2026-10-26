import { Component, booleanAttribute, input } from '@angular/core';

export type PixelPanelVariant = 'paper' | 'dark';

/**
 * Box with a stepped pixel border.
 * `variant="paper"` (default): paper background, ink text. `variant="dark"`: ink background, paper text.
 * `raised` adds a stepped drop shadow. Set `--panel-padding` to change the inner spacing.
 */
@Component({
  selector: 'app-pixel-panel',
  template: `<div class="pixel-panel__frame"><ng-content /></div>`,
  styleUrl: './pixel-panel.component.scss',
  host: {
    '[class.pixel-panel--dark]': 'variant() === "dark"',
    '[class.pixel-panel--raised]': 'raised()',
  },
})
export class PixelPanelComponent {
  readonly variant = input<PixelPanelVariant>('paper');
  readonly raised = input(false, { transform: booleanAttribute });
}
