import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

import { I18nService } from '../core/i18n.service';
import { IntroService } from '../core/intro.service';
import { MotionService } from '../core/motion.service';
import { HUD_OFFSET, SmoothScrollService } from '../core/smooth-scroll.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { MARKER_SPRITE } from '../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { HeroStageComponent } from './hero-stage/hero-stage.component';

const NAME = 'Kenan Fajic';

/**
 * WORLD 1-1: name, typing subtitle, intro and CTAs next to the voxel island. The entrance
 * (letters dropping in, then the rest) waits for `IntroService.introDone`. While the hero
 * scrolls away, the island drifts up and shrinks a little.
 */
@Component({
  selector: 'app-hero',
  imports: [DialogBoxComponent, HeroStageComponent, PixelArtComponent, PixelButtonComponent, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly subtitles = computed(() => this.i18n.list('hero.subtitles'));
  private readonly typingSpeed = 70;
  private readonly deletingSpeed = 38;
  private readonly holdDelay = 1400;
  private typingTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly subtitleIndex = signal(0);
  private readonly characterIndex = signal(0);
  private isDeleting = false;
  private scrollContext: gsap.Context | undefined;

  protected readonly introDone = inject(IntroService).introDone;
  protected readonly name = NAME;
  protected readonly nameWords = splitName(NAME);
  protected readonly marker = MARKER_SPRITE;

  // Derived from the current language, so switching it swaps the typed text immediately.
  private readonly currentSubtitle = computed(() => {
    const subtitles = this.subtitles();

    return subtitles[this.subtitleIndex() % subtitles.length] ?? '';
  });

  /** Under reduced motion the subtitles swap whole instead of being typed. */
  protected readonly displayedSubtitle = computed(() =>
    this.motion.reducedMotion()
      ? this.currentSubtitle()
      : this.currentSubtitle().slice(0, this.characterIndex()),
  );

  /** The typed text is hidden from screen readers; they get all subtitles at once. */
  protected readonly subtitleSummary = computed(() => this.subtitles().join(', '));

  constructor() {
    const rendered = signal(false);
    afterNextRender(() => rendered.set(true));

    effect(() => {
      if (this.introDone()) {
        untracked(() => {
          if (!this.typingTimer) {
            this.typeNextCharacter();
          }
        });
      }
    });

    effect(() => {
      if (!rendered()) {
        return;
      }

      const reduced = this.motion.reducedMotion();
      untracked(() => {
        this.scrollContext?.revert();
        this.scrollContext = undefined;

        if (!reduced) {
          this.zone.runOutsideAngular(() => this.driftOnScroll());
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.typingTimer);
      this.scrollContext?.revert();
    });
  }

  protected scrollToProjects(): void {
    this.smoothScroll.scrollTo('#projects', { offset: -HUD_OFFSET });
  }

  private driftOnScroll(): void {
    const stage = this.stage().nativeElement;

    this.scrollContext = gsap.context(() => {
      gsap.to(stage, {
        yPercent: -12,
        scale: 0.9,
        ease: 'none',
        scrollTrigger: { trigger: this.host, start: 0, end: 'bottom top', scrub: true },
      });
    }, this.host);
  }

  private typeNextCharacter(): void {
    const length = this.currentSubtitle().length;
    // Clamped because a language switch can make the current subtitle shorter.
    const characterIndex = Math.min(
      this.characterIndex() + (this.isDeleting ? -1 : 1),
      length,
    );

    this.characterIndex.set(Math.max(characterIndex, 0));

    if (!this.isDeleting && characterIndex === length) {
      this.isDeleting = true;
      this.typingTimer = setTimeout(() => this.typeNextCharacter(), this.holdDelay);
      return;
    }

    if (this.isDeleting && characterIndex <= 0) {
      this.isDeleting = false;
      this.subtitleIndex.update((index) => (index + 1) % this.subtitles().length);
    }

    this.typingTimer = setTimeout(
      () => this.typeNextCharacter(),
      this.isDeleting ? this.deletingSpeed : this.typingSpeed,
    );
  }
}

/** Upper-case letters per word, numbered across the whole name (the drop-in order). */
function splitName(name: string): { char: string; index: number }[][] {
  let index = 0;

  return name
    .toUpperCase()
    .split(' ')
    .map((word) => Array.from(word, (char) => ({ char, index: index++ })));
}
