import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

import { SectionId, World } from '../../core/worlds';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { CLOSE_SPRITE, MARKER_SPRITE } from '../../ui/pixel-art/sprites';
import { LangToggleComponent } from '../lang-toggle/lang-toggle.component';

export interface PauseMenuSelection {
  section: SectionId;
  event: Event;
}

/**
 * Full-screen mobile navigation. Opens with the current world selected; ↑/↓ (and Home/End)
 * move the ▶ selection, Enter follows it, Esc or the close button closes. Focus stays inside.
 * The parent owns opening/closing and locking the page scroll.
 */
@Component({
  selector: 'app-pause-menu',
  imports: [TranslatePipe, PixelArtComponent, LangToggleComponent],
  templateUrl: './pause-menu.component.html',
  styleUrl: './pause-menu.component.scss',
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'pause-menu-title',
    '(keydown)': 'onKeydown($event)',
  },
})
export class PauseMenuComponent {
  readonly items = input.required<readonly World[]>();
  readonly active = input.required<SectionId>();
  readonly selected = output<PauseMenuSelection>();
  readonly closed = output<void>();

  protected readonly marker = MARKER_SPRITE;
  protected readonly closeIcon = CLOSE_SPRITE;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    afterNextRender(() => {
      const links = this.links();
      const current = links.find((link) => link.dataset['section'] === this.active());
      (current ?? links[0])?.focus();
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closed.emit();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault();
        this.moveSelection(event.key);
        break;
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  private moveSelection(key: string): void {
    const links = this.links();
    const last = links.length - 1;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next: number;

    if (key === 'Home') {
      next = 0;
    } else if (key === 'End') {
      next = last;
    } else if (current === -1) {
      next = key === 'ArrowDown' ? 0 : last;
    } else {
      next = (current + (key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    }

    links[next]?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = Array.from(
      this.host.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !this.host.contains(active))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (active === last || !this.host.contains(active))) {
      event.preventDefault();
      first?.focus();
    }
  }

  private links(): HTMLAnchorElement[] {
    return Array.from(this.host.querySelectorAll<HTMLAnchorElement>('.pause__link'));
  }
}
