import { Component, OnDestroy, inject } from '@angular/core';

import { MotionService } from '../core/motion.service';
import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { PixelTagComponent } from '../ui/pixel-tag/pixel-tag.component';

interface AboutStat {
  labelKey: I18nKey;
  target: number;
  suffix: string;
  value: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PixelButtonComponent, PixelTagComponent, RevealDirective, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnDestroy {
  private readonly motion = inject(MotionService);
  private frameId: number | undefined;
  private hasAnimatedStats = false;

  protected readonly facts: I18nKey[] = [
    'about.facts.location',
    'about.facts.education',
    'about.facts.languages',
  ];
  protected readonly stats: AboutStat[] = [
    { labelKey: 'about.stats.projects', target: 2, suffix: '', value: 0 },
    { labelKey: 'about.stats.mentorship', target: 4, suffix: '', value: 0 },
    { labelKey: 'about.stats.areas', target: 6, suffix: '+', value: 0 },
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
