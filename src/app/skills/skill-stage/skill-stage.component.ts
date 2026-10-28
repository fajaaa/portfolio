import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/motion.service';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { SkillCardComponent } from '../skill-card/skill-card.component';
import { SKILL_ICONS } from '../skill-icons';
import { SKILLS, Skill } from '../skills.data';

/**
 * The fighter-select spotlight: the selected skill stands on an underwater stage (light beam,
 * bubbles, sand floor), with its fighter card below.
 * A new skill warps in with a stepped squash and a white flash (skipped under reduced motion).
 */
@Component({
  selector: 'app-skill-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelArtComponent, SkillCardComponent],
  templateUrl: './skill-stage.component.html',
  styleUrl: './skill-stage.component.scss',
})
export class SkillStageComponent {
  readonly skill = input.required<Skill>();

  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly fighter = viewChild.required<ElementRef<HTMLElement>>('fighter');
  private readonly flash = viewChild.required<ElementRef<HTMLElement>>('flash');
  private warp: gsap.core.Timeline | undefined;

  protected readonly skills = SKILLS;

  protected readonly icon = computed(() => SKILL_ICONS[this.skill().id]);
  /** Roster slot number, "#07". */
  protected readonly number = computed(() =>
    String(SKILLS.indexOf(this.skill()) + 1).padStart(2, '0'),
  );

  constructor() {
    let first = true;

    effect(() => {
      this.skill();

      if (first) {
        first = false;
        return;
      }

      untracked(() => this.warpIn());
    });

    inject(DestroyRef).onDestroy(() => this.warp?.kill());
  }

  private warpIn(): void {
    if (this.motion.reducedMotion()) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.warp?.kill();
      this.warp = gsap
        .timeline()
        .fromTo(
          this.fighter().nativeElement,
          { scaleX: 0.25, scaleY: 1.6, opacity: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: 0.24,
            ease: 'steps(4)',
            clearProps: 'transform,opacity',
          },
        )
        .fromTo(
          this.flash().nativeElement,
          { opacity: 0.7 },
          { opacity: 0, duration: 0.2, ease: 'steps(3)' },
          0,
        );
    });
  }
}
