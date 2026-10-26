import { Component, OnDestroy, inject } from '@angular/core';

import { MotionService } from '../core/motion.service';
import { RevealDirective } from '../shared/reveal.directive';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { PixelTagComponent } from '../ui/pixel-tag/pixel-tag.component';

interface AboutStat {
  label: string;
  target: number;
  suffix: string;
  value: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PixelButtonComponent, PixelTagComponent, RevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnDestroy {
  private readonly motion = inject(MotionService);
  private frameId: number | undefined;
  private hasAnimatedStats = false;

  protected readonly facts = [
    'Location: Lukavac, Bosnia and Herzegovina',
    'Education: FIT Mostar - Software Engineering',
    'Languages: English, Bosnian',
  ];
  protected readonly stats: AboutStat[] = [
    { label: 'Self-Initiated Projects', target: 2, suffix: '', value: 0 },
    { label: 'Mentorship Months', target: 4, suffix: '', value: 0 },
    { label: 'Technical Areas', target: 6, suffix: '+', value: 0 },
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

    if (this.motion.reducedMotion()) {
      for (const stat of this.stats) {
        stat.value = stat.target;
      }
      return;
    }

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
