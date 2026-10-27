import { Component, ElementRef, input, output, viewChildren } from '@angular/core';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { BAG_ICON } from '../skill-icons';
import { SkillCategory, SkillCategoryId } from '../skills.data';

/** Id of the tab for `bag`; the tab panel points at it with `aria-labelledby`. */
export const bagTabId = (bag: SkillCategoryId) => `skills-tab-${bag}`;

/**
 * The inventory bags as an ARIA tablist (label it with `aria-label` on the host).
 * ←/→ move between bags (wrapping), Home/End jump; the focused bag opens right away.
 */
@Component({
  selector: 'app-bag-tabs',
  imports: [PixelArtComponent, TranslatePipe],
  templateUrl: './bag-tabs.component.html',
  styleUrl: './bag-tabs.component.scss',
  host: { role: 'tablist' },
})
export class BagTabsComponent {
  readonly bags = input.required<readonly SkillCategory[]>();
  readonly active = input.required<SkillCategoryId>();
  readonly sizes = input.required<Readonly<Record<SkillCategoryId, number>>>();
  readonly capacity = input.required<number>();
  readonly panelId = input.required<string>();
  readonly selectBag = output<SkillCategoryId>();

  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected readonly bagIcon = BAG_ICON;
  protected readonly tabId = bagTabId;

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.bags().length - 1;
    const targets: Record<string, number> = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];

    if (target === undefined) {
      return;
    }

    event.preventDefault();
    this.selectBag.emit(this.bags()[target].id);
    this.tabs()[target]?.nativeElement.focus();
  }
}
