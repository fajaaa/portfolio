import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { NpcComponent } from './npc/npc.component';
import { SavePointComponent } from './save-point/save-point.component';

/**
 * WORLD 1-5, the end of the game: the NPC (Kenan) types one line about being available, next to
 * the SAVE POINT card with every way to get in touch.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogBoxComponent, NpcComponent, RevealDirective, SavePointComponent, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly i18n = inject(I18nService);

  protected readonly npcLine = computed(() => this.i18n.t('contact.npc'));

  /** True while the line is being typed (the NPC moves its mouth); a new language retypes it. */
  protected readonly talking = linkedSignal({ source: this.npcLine, computation: () => true });
}
