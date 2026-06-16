import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

interface AboutStat {
  label: string;
  target: number;
  suffix: string;
  value: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  animations: [
    trigger('fadeSlideIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(28px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('650ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
  ],
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private observer: IntersectionObserver | undefined;
  private frameId: number | undefined;
  private hasAnimatedStats = false;

  protected isVisible = false;
  protected readonly facts = [
    'Location: Sarajevo, Bosnia and Herzegovina',
    'Availability: Freelance',
    'Languages: English, Bosnian',
  ];
  protected readonly stats: AboutStat[] = [
    { label: 'Years Experience', target: 3, suffix: '+', value: 0 },
    { label: 'Projects', target: 20, suffix: '+', value: 0 },
    { label: 'Technologies', target: 10, suffix: '+', value: 0 },
  ];

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          this.ngZone.run(() => {
            this.isVisible = true;
            this.startCounters();
          });
          this.observer?.disconnect();
        },
        { threshold: 0.32 },
      );

      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private startCounters(): void {
    if (this.hasAnimatedStats) {
      return;
    }

    this.hasAnimatedStats = true;
    const duration = 1200;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      for (const stat of this.stats) {
        stat.value = Math.round(stat.target * eased);
      }

      if (progress < 1) {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    this.frameId = requestAnimationFrame(tick);
  }
}
