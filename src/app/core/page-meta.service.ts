import { Injectable, effect, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { I18nService } from './i18n.service';

const OG_LOCALES = { en: 'en_US', bs: 'bs_BA' } as const;

/**
 * Keeps the meta description (and its Open Graph / Twitter copies) in the current language.
 * index.html holds the English defaults that crawlers without JS see.
 */
@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly meta = inject(Meta);
  private readonly i18n = inject(I18nService);

  constructor() {
    effect(() => {
      const description = this.i18n.t('meta.description');
      const lang = this.i18n.lang();

      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ property: 'og:locale', content: OG_LOCALES[lang] });
      this.meta.updateTag({
        property: 'og:locale:alternate',
        content: OG_LOCALES[lang === 'en' ? 'bs' : 'en'],
      });
    });
  }
}
