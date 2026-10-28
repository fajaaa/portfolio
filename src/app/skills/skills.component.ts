import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';

import { MotionService } from '../core/motion.service';
import { SoundService } from '../core/sound.service';
import { SoundName } from '../core/sounds';
import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { PixelPanelComponent } from '../ui/pixel-panel/pixel-panel.component';
import { SkillStageComponent } from './skill-stage/skill-stage.component';
import { SKILL_ICONS } from './skill-icons';
import { SKILLS, Skill, SkillId, SkillRarity } from './skills.data';

/** Tile labels may break between camel-case parts: "Java-/Script". */
const TILE_LABELS = Object.fromEntries(
  SKILLS.map((skill) => [skill.id, skill.label.replace(/([a-z])([A-Z])/g, '$1­$2')]),
) as Record<SkillId, string>;

const RARITY_LEGEND: readonly { rarity: SkillRarity; key: I18nKey }[] = [
  { rarity: 'common', key: 'skills.rarities.common' },
  { rarity: 'rare', key: 'skills.rarities.rare' },
  { rarity: 'epic', key: 'skills.rarities.epic' },
  { rarity: 'legendary', key: 'skills.rarities.legendary' },
];

/** Gaps between the RANDOM roulette's cursor hops (ms): fast at first, then slowing to a stop. */
const ROULETTE_STEPS = [45, 45, 50, 55, 60, 70, 80, 95, 110, 130, 155, 185, 220];

/**
 * WORLD 1-4: skills as a fighting-game PLAYER SELECT screen. A 5x5 roster of tiles with a P1
 * cursor and, beside it, the stage with the selected skill. Selection follows focus, clicks/taps
 * and mouse hover; arrow keys move through the roster (roving tabindex). RANDOM spins the cursor
 * through the roster like a roulette and lands on a random skill.
 */
@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PixelArtComponent,
    PixelButtonComponent,
    PixelPanelComponent,
    RevealDirective,
    SkillStageComponent,
    TranslatePipe,
  ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  private readonly motion = inject(MotionService);
  private readonly sound = inject(SoundService);
  private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
  private readonly tiles = viewChildren<ElementRef<HTMLButtonElement>>('tile');
  private rouletteTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly skills = SKILLS;
  protected readonly icons = SKILL_ICONS;
  protected readonly tileLabels = TILE_LABELS;
  protected readonly legend = RARITY_LEGEND;

  private readonly selectedId = signal<SkillId>(SKILLS[0].id);
  protected readonly selected = computed(
    () => SKILLS.find((skill) => skill.id === this.selectedId()) ?? SKILLS[0],
  );
  protected readonly spinning = signal(false);

  /** Last skill picked by focus, click or RANDOM, for the screen reader announcement. */
  protected readonly announced = signal<Skill | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.rouletteTimer));
  }

  /** Selects `skill`, with a sound when the selection actually changes. Stops a running roulette. */
  protected select(skill: Skill, sound: SoundName = 'select'): void {
    this.stopRoulette();

    if (skill.id !== this.selectedId()) {
      this.sound.play(sound);
    }

    this.selectedId.set(skill.id);

    if (sound !== 'hover') {
      this.announced.set(skill);
    }
  }

  /** Hover selects too, but only with a mouse (touch already selects on tap) and not mid-spin. */
  protected onTilePointerEnter(event: PointerEvent, skill: Skill): void {
    if (event.pointerType === 'mouse' && !this.spinning()) {
      this.select(skill, 'hover');
    }
  }

  /** Tiles: arrows move through the grid (column count read from the live layout), Home/End jump. */
  protected onTileKeydown(event: KeyboardEvent, index: number): void {
    const target = this.tileTarget(event.key, index);

    if (target === null) {
      return;
    }

    event.preventDefault();

    if (target !== index) {
      this.select(SKILLS[target]);
      this.tiles()[target]?.nativeElement.focus();
    }
  }

  /** RANDOM: hop the cursor through the roster, slowing down, and land on a random skill. */
  protected spin(): void {
    if (this.spinning()) {
      return;
    }

    if (this.motion.reducedMotion()) {
      this.land(this.randomOther(this.selectedId()));
      return;
    }

    this.spinning.set(true);
    let step = 0;

    const hop = () => {
      const next = this.randomOther(this.selectedId());

      if (step === ROULETTE_STEPS.length) {
        this.spinning.set(false);
        this.land(next);
        return;
      }

      this.selectedId.set(next.id);
      this.sound.play('tick');
      this.rouletteTimer = setTimeout(hop, ROULETTE_STEPS[step++]);
    };

    hop();
  }

  private land(skill: Skill): void {
    this.selectedId.set(skill.id);
    this.sound.play('powerUp');
    this.announced.set(skill);
  }

  private stopRoulette(): void {
    clearTimeout(this.rouletteTimer);
    this.spinning.set(false);
  }

  private randomOther(current: SkillId): Skill {
    const others = SKILLS.filter((skill) => skill.id !== current);

    return others[Math.floor(Math.random() * others.length)];
  }

  private tileTarget(key: string, index: number): number | null {
    const last = SKILLS.length - 1;
    const columns = this.columns();

    switch (key) {
      case 'ArrowLeft':
        return Math.max(index - 1, 0);
      case 'ArrowRight':
        return Math.min(index + 1, last);
      case 'ArrowUp':
        return index - columns >= 0 ? index - columns : index;
      case 'ArrowDown':
        return index + columns <= last ? index + columns : index;
      case 'Home':
        return 0;
      case 'End':
        return last;
      default:
        return null;
    }
  }

  private columns(): number {
    const template = getComputedStyle(this.grid().nativeElement).gridTemplateColumns;

    return Math.max(template.split(' ').filter(Boolean).length, 1);
  }
}
