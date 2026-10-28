import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { MAX_LEVEL, RARITY_LEVEL, Skill, SkillRarity, SkillType } from '../skills.data';

const TYPE_KEYS: Record<SkillType, I18nKey> = {
  language: 'skills.types.language',
  framework: 'skills.types.framework',
  database: 'skills.types.database',
  tool: 'skills.types.tool',
  architecture: 'skills.types.architecture',
  hardware: 'skills.types.hardware',
};

const RARITY_KEYS: Record<SkillRarity, I18nKey> = {
  common: 'skills.rarities.common',
  rare: 'skills.rarities.rare',
  epic: 'skills.rarities.epic',
  legendary: 'skills.rarities.legendary',
};

/** Fighter card for one skill: name, type, rarity, LV meter, description and "Used in". */
@Component({
  selector: 'app-skill-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './skill-card.component.html',
  styleUrl: './skill-card.component.scss',
})
export class SkillCardComponent {
  readonly skill = input.required<Skill>();

  protected readonly segments = Array.from({ length: MAX_LEVEL }, (_, index) => index);

  protected readonly typeKey = computed(() => TYPE_KEYS[this.skill().type]);
  protected readonly rarityKey = computed(() => RARITY_KEYS[this.skill().rarity]);
  protected readonly level = computed(() => RARITY_LEVEL[this.skill().rarity]);
}
