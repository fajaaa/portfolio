import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { IntroService } from './core/intro.service';
import { KonamiService } from './core/konami.service';
import { SmoothScrollService } from './core/smooth-scroll.service';
import { TranslatePipe } from './i18n/translate.pipe';
import { IntroComponent } from './intro/intro.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PixelArtComponent } from './ui/pixel-art/pixel-art.component';
import { ARROW_UP_SPRITE } from './ui/pixel-art/sprites';
import { PixelButtonComponent } from './ui/pixel-button/pixel-button.component';
import { ToastOutletComponent } from './ui/toast-outlet/toast-outlet.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    NavbarComponent,
    TranslatePipe,
    PixelArtComponent,
    PixelButtonComponent,
    ToastOutletComponent,
    IntroComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly konami = inject(KonamiService);

  protected readonly intro = inject(IntroService);

  protected readonly arrowUp = ARROW_UP_SPRITE;
  protected readonly showBackToTop = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.smoothScroll.init();
      const stopScroll = this.smoothScroll.onScroll(({ y }) => this.showBackToTop.set(y > 520));
      const disconnectKonami = this.konami.connect();
      destroyRef.onDestroy(() => {
        stopScroll();
        disconnectKonami();
      });
    });
  }

  protected scrollToTop(): void {
    this.smoothScroll.scrollTo(0);
  }
}
