import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { MotionService } from '../core/motion.service';
import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { DOWNLOAD_SPRITE } from '../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { PixelPanelComponent } from '../ui/pixel-panel/pixel-panel.component';
import { PixelProgressComponent } from '../ui/pixel-progress/pixel-progress.component';
import { PixelPortraitComponent } from './pixel-portrait/pixel-portrait.component';

interface SheetRow {
  labelKey: I18nKey;
  valueKey?: I18nKey;
  /** Untranslated value (used when there is no `valueKey`). */
  value?: string;
}

interface AboutStat {
  labelKey: I18nKey;
  value: number;
  suffix: string;
  /** Full bar; the bars only compare, the number always shows the real value. */
  max: number;
  color: string;
}

const COUNT_MS = 1200;
/** Lets the staggered panel entrance settle before the counters start. */
const COUNT_DELAY_MS = 250;

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogBoxComponent,
    PixelArtComponent,
    PixelButtonComponent,
    PixelPanelComponent,
    PixelPortraitComponent,
    PixelProgressComponent,
    RevealDirective,
    TranslatePipe,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly zone = inject(NgZone);
  private readonly motion = inject(MotionService);
  private readonly statsPanel = viewChild.required('statsPanel', { read: ElementRef });

  protected readonly downloadIcon = DOWNLOAD_SPRITE;

  protected readonly header: SheetRow[] = [
    { labelKey: 'about.header.name', value: 'Kenan Fajic' },
    { labelKey: 'about.header.class', valueKey: 'about.header.classValue' },
    { labelKey: 'about.header.level', valueKey: 'about.header.levelValue' },
  ];

  protected readonly attributes: SheetRow[] = [
    { labelKey: 'about.attributes.origin', valueKey: 'about.attributes.originValue' },
    { labelKey: 'about.attributes.guild', valueKey: 'about.attributes.guildValue' },
    { labelKey: 'about.attributes.languages', valueKey: 'about.attributes.languagesValue' },
  ];

  protected readonly stats: AboutStat[] = [
    { labelKey: 'about.stats.projects', value: 2, suffix: '', max: 5, color: 'var(--xp)' },
    { labelKey: 'about.stats.mentorship', value: 4, suffix: '', max: 12, color: 'var(--coin)' },
    { labelKey: 'about.stats.areas', value: 6, suffix: '+', max: 10, color: 'var(--w13-crystal-cyan)' },
  ];

  /** Eased 0–1 progress of the count-up, shared by all numbers and bars. */
  protected readonly progress = signal(0);

  constructor() {
    let observer: IntersectionObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;

    const count = () => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - startedAt) / COUNT_MS, 1);
        this.progress.set(1 - Math.pow(1 - t, 3));
        frame = t < 1 ? requestAnimationFrame(tick) : undefined;
      };
      frame = requestAnimationFrame(tick);
    };

    afterNextRender(() => {
      if (this.motion.reducedMotion() || !('IntersectionObserver' in window)) {
        this.progress.set(1);
        return;
      }

      this.zone.runOutsideAngular(() => {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry?.isIntersecting) {
              return;
            }

            observer?.disconnect();

            if (this.motion.reducedMotion()) {
              this.progress.set(1);
            } else {
              timeout = setTimeout(count, COUNT_DELAY_MS);
            }
          },
          { threshold: 0.4 },
        );
        observer.observe(this.statsPanel().nativeElement);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      clearTimeout(timeout);

      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    });
  }

  protected shown(stat: AboutStat): number {
    return Math.round(stat.value * this.progress());
  }

  protected fill(stat: AboutStat): number {
    return (stat.value * this.progress()) / stat.max;
  }
}
