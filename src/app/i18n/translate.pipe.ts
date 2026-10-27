import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import { I18nKey, I18nParams } from './i18n.types';

/**
 * `{{ 'hero.start' | t }}` or `{{ 'projects.card.codeLabel' | t: { title } }}`.
 * Impure and reading the `lang` signal, so the view re-renders as soon as the language changes.
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: I18nKey, params?: I18nParams): string {
    return this.i18n.t(key, params);
  }
}
