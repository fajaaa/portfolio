import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import { I18nKey, LANGS, Lang } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';

/** Pixel EN | BS switch. Add the `lang-toggle--large` class for the pause menu size. */
@Component({
  selector: 'app-lang-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @for (lang of langs; track lang) {
      <button
        class="lang-toggle__button"
        type="button"
        [class.lang-toggle__button--active]="i18n.lang() === lang"
        [attr.aria-pressed]="i18n.lang() === lang"
        [attr.aria-label]="labels[lang] | t"
        [attr.lang]="lang"
        (click)="i18n.setLang(lang)"
      >
        {{ lang.toUpperCase() }}
      </button>
    }
  `,
  styleUrl: './lang-toggle.component.scss',
  host: {
    role: 'group',
    '[attr.aria-label]': 'i18n.t("nav.language.label")',
  },
})
export class LangToggleComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly langs = LANGS;
  protected readonly labels: Record<Lang, I18nKey> = {
    en: 'nav.language.en',
    bs: 'nav.language.bs',
  };
}
