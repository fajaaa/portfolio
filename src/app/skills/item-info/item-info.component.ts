import { Component, computed, input } from '@angular/core';

import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { SKILL_ICONS } from '../skill-icons';
import { Skill, SkillRarity, SkillType } from '../skills.data';

const TYPE_KEYS: Record<SkillType, I18nKey> = {
  language: 'skills.types.language',
  framework: 'skills.types.framework',
  database: 'skills.types.database',
  tool: 'skills.types.tool',
};

const RARITY_KEYS: Record<SkillRarity, I18nKey> = {
  common: 'skills.rarities.common',
  rare: 'skills.rarities.rare',
  epic: 'skills.rarities.epic',
  legendary: 'skills.rarities.legendary',
};

/** ITEM INFO card for one skill: big icon, name, type, rarity, description and "Used in". */
@Component({
  selector: 'app-item-info',
  imports: [PixelArtComponent, TranslatePipe],
  templateUrl: './item-info.component.html',
  styleUrl: './item-info.component.scss',
})
export class ItemInfoComponent {
  readonly skill = input.required<Skill>();

  protected readonly icon = computed(() => SKILL_ICONS[this.skill().id]);
  protected readonly typeKey = computed(() => TYPE_KEYS[this.skill().type]);
  protected readonly rarityKey = computed(() => RARITY_KEYS[this.skill().rarity]);
}
