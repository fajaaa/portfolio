import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { NPC_BOB, NPC_IDLE, NPC_TALK } from '../contact-sprites';

/**
 * Kenan as a pixel NPC. Idle: a 2-frame breathing bob; `talking`: mouth open / closed.
 * The frames are stacked and switched with `steps()` animations. Decorative.
 */
@Component({
  selector: 'app-npc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelArtComponent],
  template: `
    <app-pixel-art class="npc__frame npc__frame--idle" [sprite]="frames.idle" />
    <app-pixel-art class="npc__frame npc__frame--bob" [sprite]="frames.bob" />
    <app-pixel-art class="npc__frame npc__frame--talk" [sprite]="frames.talk" />
  `,
  styleUrl: './npc.component.scss',
  host: {
    'aria-hidden': 'true',
    '[class.npc--talking]': 'talking()',
  },
})
export class NpcComponent {
  readonly talking = input(false, { transform: booleanAttribute });

  protected readonly frames = { idle: NPC_IDLE, bob: NPC_BOB, talk: NPC_TALK };
}
