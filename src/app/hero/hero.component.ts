import { CommonModule } from '@angular/common';
import { Component, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  animations: [
    trigger('subtitleType', [
      transition('* => *', [
        style({ opacity: 0.55 }),
        animate('120ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly subtitles = ['Full-Stack Developer', 'Angular Enthusiast', 'Problem Solver'];
  private readonly typingSpeed = 70;
  private readonly deletingSpeed = 38;
  private readonly holdDelay = 1400;
  private typingTimer: ReturnType<typeof window.setTimeout> | undefined;
  private subtitleIndex = 0;
  private characterIndex = 0;
  private isDeleting = false;

  protected displayedSubtitle = '';

  @HostBinding('style.--hero-shift-x.px')
  protected shiftX = 0;

  @HostBinding('style.--hero-shift-y.px')
  protected shiftY = 0;

  ngOnInit(): void {
    this.typeNextCharacter();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      window.clearTimeout(this.typingTimer);
    }
  }

  @HostListener('mousemove', ['$event'])
  protected onMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    this.shiftX = Number((x * 18).toFixed(2));
    this.shiftY = Number((y * 18).toFixed(2));
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    this.shiftX = 0;
    this.shiftY = 0;
  }

  protected scrollToProjects(): void {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private typeNextCharacter(): void {
    const currentSubtitle = this.subtitles[this.subtitleIndex];

    if (this.isDeleting) {
      this.characterIndex -= 1;
    } else {
      this.characterIndex += 1;
    }

    this.displayedSubtitle = currentSubtitle.slice(0, this.characterIndex);

    if (!this.isDeleting && this.characterIndex === currentSubtitle.length) {
      this.isDeleting = true;
      this.typingTimer = window.setTimeout(() => this.typeNextCharacter(), this.holdDelay);
      return;
    }

    if (this.isDeleting && this.characterIndex === 0) {
      this.isDeleting = false;
      this.subtitleIndex = (this.subtitleIndex + 1) % this.subtitles.length;
    }

    this.typingTimer = window.setTimeout(
      () => this.typeNextCharacter(),
      this.isDeleting ? this.deletingSpeed : this.typingSpeed,
    );
  }
}
