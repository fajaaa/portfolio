import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { HUD_OFFSET, SmoothScrollService } from '../core/smooth-scroll.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [PixelButtonComponent, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly i18n = inject(I18nService);
  private readonly subtitles = computed(() => this.i18n.list('hero.subtitles'));
  private readonly typingSpeed = 70;
  private readonly deletingSpeed = 38;
  private readonly holdDelay = 1400;
  private typingTimer: ReturnType<typeof window.setTimeout> | undefined;
  private readonly subtitleIndex = signal(0);
  private readonly characterIndex = signal(0);
  private isDeleting = false;

  // Derived from the current language, so switching it swaps the typed text immediately.
  private readonly currentSubtitle = computed(() => {
    const subtitles = this.subtitles();

    return subtitles[this.subtitleIndex() % subtitles.length] ?? '';
  });

  protected readonly displayedSubtitle = computed(() =>
    this.currentSubtitle().slice(0, this.characterIndex()),
  );

  ngOnInit(): void {
    this.typeNextCharacter();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      window.clearTimeout(this.typingTimer);
    }
  }

  protected scrollToProjects(): void {
    this.smoothScroll.scrollTo('#projects', { offset: -HUD_OFFSET });
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
      this.typingTimer = window.setTimeout(() => this.typeNextCharacter(), this.holdDelay);
      return;
    }

    if (this.isDeleting && characterIndex <= 0) {
      this.isDeleting = false;
      this.subtitleIndex.update((index) => (index + 1) % this.subtitles().length);
    }

    this.typingTimer = window.setTimeout(
      () => this.typeNextCharacter(),
      this.isDeleting ? this.deletingSpeed : this.typingSpeed,
    );
  }
}
