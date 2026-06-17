import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';

interface AboutStat {
  label: string;
  target: number;
  suffix: string;
  value: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatIconModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnDestroy {
  private frameId: number | undefined;
  private hasAnimatedStats = false;

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

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  protected startCounters(): void {
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
