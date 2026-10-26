import { Component, HostListener, afterNextRender, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SmoothScrollService } from './core/smooth-scroll.service';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly smoothScroll = inject(SmoothScrollService);

  protected readonly title = signal('portfolio');
  protected showBackToTop = false;

  constructor() {
    afterNextRender(() => this.smoothScroll.init());
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 520;
  }

  protected scrollToTop(): void {
    this.smoothScroll.scrollTo(0);
  }
}
