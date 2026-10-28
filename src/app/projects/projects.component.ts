import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { I18nService } from '../core/i18n.service';
import { MotionService } from '../core/motion.service';
import { SoundService } from '../core/sound.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { CartridgeComponent } from './cartridge/cartridge.component';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { Project, ProjectsService } from './projects.service';

const FLASH_MS = 140;

/**
 * WORLD 1-3: GitHub projects as cartridges. Picking one plays the insert animation (cartridge
 * slides in, the screen flashes), then opens the game screen; closing it ejects the cartridge.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CartridgeComponent,
    DialogBoxComponent,
    GameScreenComponent,
    RevealDirective,
    TranslatePipe,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  private readonly sound = inject(SoundService);
  private readonly zone = inject(NgZone);
  private readonly flash = viewChild.required<ElementRef<HTMLElement>>('flash');
  private activeCartridge: CartridgeComponent | null = null;
  private inserting = false;

  /** `undefined` while loading (the service falls back to built-in projects on errors). */
  protected readonly projects = toSignal(inject(ProjectsService).getProjects());
  protected readonly playing = signal<Project | null>(null);

  protected readonly count = computed(() => {
    const projects = this.projects();
    return projects ? this.i18n.plural('projects.count', projects.length) : '';
  });

  protected async play(project: Project, cartridge: CartridgeComponent): Promise<void> {
    if (this.inserting || this.playing()) {
      return;
    }

    this.inserting = true;
    this.sound.play('select');

    try {
      if (!this.motion.reducedMotion()) {
        await this.zone.runOutsideAngular(() => cartridge.insert());
        await this.zone.runOutsideAngular(() => this.flashScreen());
      }

      this.activeCartridge = cartridge;
      this.playing.set(project);
    } finally {
      this.inserting = false;
    }
  }

  protected onScreenClosed(): void {
    this.sound.play('back');
    this.playing.set(null);
    this.activeCartridge?.eject();
    this.activeCartridge = null;
  }

  /** One short, stepped flash over the whole page (well under the 3-flashes-a-second limit). */
  private flashScreen(): Promise<void> {
    const flash = this.flash().nativeElement;

    if (typeof flash.animate !== 'function') {
      return Promise.resolve();
    }

    const step = 'steps(1, end)';

    return flash
      .animate(
        [
          { opacity: 0.85, easing: step },
          { opacity: 0.4, easing: step },
          { opacity: 0 },
        ],
        { duration: FLASH_MS },
      )
      .finished.then(
        () => undefined,
        () => undefined,
      );
  }
}
