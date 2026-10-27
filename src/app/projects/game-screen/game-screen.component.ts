import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import { SmoothScrollService } from '../../core/smooth-scroll.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { DialogBoxComponent } from '../../ui/dialog-box/dialog-box.component';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { PixelButtonComponent } from '../../ui/pixel-button/pixel-button.component';
import { PixelTagComponent } from '../../ui/pixel-tag/pixel-tag.component';
import { coverFor } from '../covers/covers';
import { Project } from '../projects.service';

/**
 * The "game screen" modal for one project, built on a native `<dialog>` (`showModal()` gives
 * the focus trap, inert page and Esc for free). Opens while `project` is set; Esc, EJECT or a
 * click on the backdrop close it, and `closed` tells the parent to clear `project`.
 * Page scrolling is stopped while it is open.
 */
@Component({
  selector: 'app-game-screen',
  imports: [
    DialogBoxComponent,
    PixelArtComponent,
    PixelButtonComponent,
    PixelTagComponent,
    TranslatePipe,
  ],
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.scss',
})
export class GameScreenComponent {
  readonly project = input<Project | null>(null);
  readonly closed = output<void>();

  private readonly i18n = inject(I18nService);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly cover = computed(() => {
    const project = this.project();
    return project ? coverFor(project.title) : null;
  });

  /** Translated override first, then the (untranslated) GitHub description, then a default. */
  protected readonly description = computed(() => {
    const project = this.project();

    if (project?.descriptionKey) {
      return this.i18n.t(project.descriptionKey);
    }

    return project?.description || this.i18n.t('projects.defaultDescription');
  });

  constructor() {
    afterRenderEffect(() => {
      const shouldOpen = !!this.project();
      const dialog = this.dialog().nativeElement;

      untracked(() => {
        if (shouldOpen && !dialog.open) {
          dialog.showModal();
          this.smoothScroll.stop();
        } else if (!shouldOpen && dialog.open) {
          dialog.close();
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.project()) {
        this.smoothScroll.start();
      }
    });
  }

  protected eject(): void {
    this.dialog().nativeElement.close();
  }

  /** Fires for every way of closing (Esc, EJECT, backdrop). */
  protected onClose(): void {
    this.smoothScroll.start();
    this.closed.emit();
  }

  /** Clicks on the backdrop target the dialog itself but land outside its box. */
  protected onClick(event: MouseEvent): void {
    const dialog = this.dialog().nativeElement;

    if (event.target !== dialog) {
      return;
    }

    const box = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;

    if (!inside) {
      dialog.close();
    }
  }
}
