import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import { SoundService } from '../../core/sound.service';
import { ToastService } from '../../core/toast.service';
import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent, PixelSprite } from '../../ui/pixel-art/pixel-art.component';
import { DOWNLOAD_SPRITE } from '../../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../../ui/pixel-button/pixel-button.component';
import { PixelPanelComponent } from '../../ui/pixel-panel/pixel-panel.component';
import {
  COPY_SPRITE,
  GITHUB_SPRITE,
  LINKEDIN_SPRITE,
  MAIL_SPRITE,
  SAVE_CRYSTAL_SPRITE,
} from '../contact-sprites';

interface ProfileLink {
  labelKey: I18nKey;
  value: string;
  href: string;
  icon: PixelSprite;
}

/** How long the copy button says "Copied!". */
const COPIED_MS = 2000;

/**
 * SAVE POINT: everything needed to get in touch, in one card. Availability (job, internship,
 * freelance), the email address with COPY (clipboard, coin sound and toast) and WRITE (mailto),
 * LinkedIn, GitHub and the CV download.
 */
@Component({
  selector: 'app-save-point',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelArtComponent, PixelButtonComponent, PixelPanelComponent, TranslatePipe],
  templateUrl: './save-point.component.html',
  styleUrl: './save-point.component.scss',
})
export class SavePointComponent {
  private readonly i18n = inject(I18nService);
  private readonly sound = inject(SoundService);
  private readonly toasts = inject(ToastService);
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly email = 'kenanfajic25@gmail.com';
  protected readonly icons = {
    crystal: SAVE_CRYSTAL_SPRITE,
    copy: COPY_SPRITE,
    mail: MAIL_SPRITE,
    download: DOWNLOAD_SPRITE,
  };

  protected readonly links: readonly ProfileLink[] = [
    {
      labelKey: 'contact.links.linkedin',
      value: 'linkedin.com/in/kenan-fajic',
      href: 'https://www.linkedin.com/in/kenan-fajic',
      icon: LINKEDIN_SPRITE,
    },
    {
      labelKey: 'contact.links.github',
      value: 'github.com/fajaaa',
      href: 'https://github.com/fajaaa',
      icon: GITHUB_SPRITE,
    },
  ];

  protected readonly roles = computed(() => this.i18n.list('contact.savePoint.roles'));
  protected readonly copied = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.email);
    } catch {
      this.toasts.show({ title: this.i18n.t('contact.savePoint.copyFailed'), key: 'copy-email' });
      return;
    }

    this.sound.play('coin');
    this.toasts.show({
      title: this.i18n.t('contact.savePoint.copied'),
      detail: this.email,
      key: 'copy-email',
    });

    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), COPIED_MS);
  }
}
