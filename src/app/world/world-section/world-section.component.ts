import { Component, computed, input } from '@angular/core';

import { SectionId, WORLDS, WorldId } from '../../core/worlds';
import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { WorldBackgroundComponent } from '../world-background/world-background.component';

/**
 * Frames a page section as a game world: pixel backdrop, a "WORLD 1-x · NAME" plate and the
 * projected content. The host carries the section `id` (the scroll / nav target). Every world
 * after the first starts with a stepped edge in the previous world's floor colour.
 */
@Component({
  selector: 'app-world-section',
  imports: [TranslatePipe, WorldBackgroundComponent],
  template: `
    <app-world-background [world]="world()" />

    <div class="world__inner">
      <div class="world__plate-row">
        <p class="world__plate">
          <span class="world__plate-id">{{ 'hud.world' | t: { world: world() } }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ labelKey() | t }}</span>
        </p>
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

  protected readonly isFirst = computed(() => this.world() === WORLDS[0].id);
}
