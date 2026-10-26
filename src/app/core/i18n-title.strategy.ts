import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { I18nKey } from '../i18n/i18n.types';
import { I18nService } from './i18n.service';

/** Treats route `title`s as i18n keys and re-translates the document title on language change. */
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);
  private readonly key = signal<I18nKey | undefined>(undefined);

  constructor() {
    super();

    effect(() => {
      const key = this.key();

      if (key) {
        this.title.setTitle(this.i18n.t(key));
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.key.set(this.buildTitle(snapshot) as I18nKey | undefined);
  }
}
