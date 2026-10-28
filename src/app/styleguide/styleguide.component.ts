import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { MotionService } from '../core/motion.service';
import { RevealDirective } from '../shared/reveal.directive';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { PixelPanelComponent } from '../ui/pixel-panel/pixel-panel.component';
import { PixelProgressComponent } from '../ui/pixel-progress/pixel-progress.component';
import { PixelTagComponent } from '../ui/pixel-tag/pixel-tag.component';

interface World {
  id: string;
  name: string;
  background: string;
}

/** Dev-only page (/styleguide) showing every UI primitive on every world background. */
@Component({
  selector: 'app-styleguide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogBoxComponent,
    PixelButtonComponent,
    PixelPanelComponent,
    PixelProgressComponent,
    PixelTagComponent,
    RevealDirective,
  ],
  templateUrl: './styleguide.component.html',
  styleUrl: './styleguide.component.scss',
})
export class StyleguideComponent {
  protected readonly reducedMotion = inject(MotionService).reducedMotion;

  protected readonly worlds: World[] = [
    { id: '1-1', name: 'Sky', background: 'var(--w11-sky)' },
    { id: '1-2', name: 'Forest', background: 'var(--w12-bg)' },
    { id: '1-3', name: 'Underground', background: 'var(--w13-bg)' },
    { id: '1-4', name: 'Water', background: 'var(--w14-bg)' },
    { id: '1-5', name: 'Castle', background: 'var(--w15-bg)' },
  ];

  protected readonly diacritics = 'čćšžđ ČĆŠŽĐ';
  protected readonly dialogText =
    'Dobrodošli! Welcome, traveller. Click this box to skip the typing.';

  /** Bumping it re-creates the dialog boxes so the typewriter plays again. */
  protected readonly replay = signal(0);
  protected readonly bars = signal([0.7, 0.4, 1]);
  protected readonly typedCount = signal(0);

  protected randomizeBars(): void {
    this.bars.set(this.bars().map(() => Math.round(Math.random() * 10) / 10));
  }
}
