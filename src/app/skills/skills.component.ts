import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../core/motion.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { PixelPanelComponent } from '../ui/pixel-panel/pixel-panel.component';
import { BagTabsComponent, bagTabId } from './bag-tabs/bag-tabs.component';
import { ItemInfoComponent } from './item-info/item-info.component';
import { SKILL_ICONS } from './skill-icons';
import { SKILLS, SKILL_CATEGORIES, Skill, SkillCategoryId, SkillId } from './skills.data';

/** Every bag has the same capacity (2 rows of 6, or 3 rows of 4), so switching bags never resizes the grid. */
const BAG_CAPACITY = 12;

/** Slot labels may break between camel-case parts: "Java-/Script". */
const SLOT_LABELS = Object.fromEntries(
  SKILLS.map((skill) => [skill.id, skill.label.replace(/([a-z])([A-Z])/g, '$1\u00AD$2')]),
) as Record<SkillId, string>;

const itemsIn = (bag: SkillCategoryId) => SKILLS.filter((skill) => skill.category === bag);

/**
 * WORLD 1-4: skills as an RPG inventory. Bags (tabs) per category, a slot grid per bag and an
 * ITEM INFO panel for the selected item. Selection follows focus, clicks/taps and mouse hover;
 * arrow keys move through the tabs and the slots (roving tabindex).
 */
@Component({
  selector: 'app-skills',
  imports: [
    BagTabsComponent,
    ItemInfoComponent,
    PixelArtComponent,
    PixelPanelComponent,
    RevealDirective,
    TranslatePipe,
  ],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly grid = viewChild.required<ElementRef<HTMLElement>>('grid');
  private readonly slotButtons = viewChildren<ElementRef<HTMLButtonElement>>('slot');
  private revealed = false;
  private restaggerTween: gsap.core.Tween | undefined;

  protected readonly bags = SKILL_CATEGORIES;
  protected readonly skills = SKILLS;
  protected readonly icons = SKILL_ICONS;
  protected readonly tabId = bagTabId;
  protected readonly slotLabels = SLOT_LABELS;
  protected readonly bagSizes = Object.fromEntries(
    SKILL_CATEGORIES.map((bag) => [bag.id, itemsIn(bag.id).length]),
  ) as Record<SkillCategoryId, number>;

  protected readonly activeBag = signal<SkillCategoryId>(SKILL_CATEGORIES[0].id);
  protected readonly activeCategory = computed(
    () => SKILL_CATEGORIES.find((bag) => bag.id === this.activeBag()) ?? SKILL_CATEGORIES[0],
  );
  protected readonly items = computed(() => itemsIn(this.activeBag()));
  protected readonly capacity = Math.max(
    BAG_CAPACITY,
    ...SKILL_CATEGORIES.map(
      (bag) => Math.ceil(itemsIn(bag.id).length / BAG_CAPACITY) * BAG_CAPACITY,
    ),
  );

  /** The bag's items followed by empty slots up to the capacity. */
  protected readonly slots = computed(() => {
    const items = this.items();

    return Array.from({ length: this.capacity }, (_, index): Skill | null => items[index] ?? null);
  });

  private readonly selectedId = signal<SkillId>(itemsIn(SKILL_CATEGORIES[0].id)[0].id);
  protected readonly selected = computed(
    () => this.items().find((skill) => skill.id === this.selectedId()) ?? this.items()[0],
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.restaggerTween?.kill());
  }

  protected selectBag(bag: SkillCategoryId): void {
    if (bag === this.activeBag()) {
      return;
    }

    this.activeBag.set(bag);
    this.selectedId.set(itemsIn(bag)[0].id);
    afterNextRender(() => this.restagger(), { injector: this.injector });
  }

  protected select(skill: Skill): void {
    this.selectedId.set(skill.id);
  }

  /** Hover selects too, but only with a mouse (touch already selects on tap). */
  protected onSlotPointerEnter(event: PointerEvent, skill: Skill): void {
    if (event.pointerType === 'mouse') {
      this.select(skill);
    }
  }

  protected onRevealed(): void {
    this.revealed = true;
  }

  /** Slots: arrows move through the grid (column count read from the live layout), Home/End jump. */
  protected onSlotKeydown(event: KeyboardEvent, index: number): void {
    const target = this.slotTarget(event.key, index);

    if (target === null) {
      return;
    }

    event.preventDefault();

    if (target !== index) {
      this.select(this.items()[target]);
      this.slotButtons()[target]?.nativeElement.focus();
    }
  }

  private slotTarget(key: string, index: number): number | null {
    const last = this.items().length - 1;
    const columns = this.columns();
    const lastRow = Math.floor(last / columns);
    const row = Math.floor(index / columns);

    switch (key) {
      case 'ArrowLeft':
        return Math.max(index - 1, 0);
      case 'ArrowRight':
        return Math.min(index + 1, last);
      case 'ArrowUp':
        return index - columns >= 0 ? index - columns : index;
      case 'ArrowDown':
        // Into a shorter last row: land on its last item.
        return row < lastRow ? Math.min(index + columns, last) : index;
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

  /** Quick stepped pop of the slots after switching bags (once the entrance has played). */
  private restagger(): void {
    if (!this.revealed || this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.restaggerTween?.kill();
      this.restaggerTween = gsap.fromTo(
        this.grid().nativeElement.children,
        { autoAlpha: 0, scale: 0.6 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: 'steps(4)',
          stagger: 0.025,
          overwrite: true,
          clearProps: 'transform,opacity,visibility',
        },
      );
    });
  }
}
