import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SmoothScrollService } from './core/smooth-scroll.service';
import { TranslatePipe } from './i18n/translate.pipe';
import { NavbarComponent } from './navbar/navbar.component';
import { PixelArtComponent } from './ui/pixel-art/pixel-art.component';
import { ARROW_UP_SPRITE } from './ui/pixel-art/sprites';
import { PixelButtonComponent } from './ui/pixel-button/pixel-button.component';
import { ToastOutletComponent } from './ui/toast-outlet/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    TranslatePipe,
    PixelArtComponent,
    PixelButtonComponent,
    ToastOutletComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly smoothScroll = inject(SmoothScrollService);

  protected readonly title = signal('portfolio');
  protected readonly arrowUp = ARROW_UP_SPRITE;
  protected readonly showBackToTop = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.smoothScroll.init();
      const stopScroll = this.smoothScroll.onScroll(({ y }) => this.showBackToTop.set(y > 520));
      destroyRef.onDestroy(stopScroll);
    });
  }

  protected scrollToTop(): void {
    this.smoothScroll.scrollTo(0);
  }
}
