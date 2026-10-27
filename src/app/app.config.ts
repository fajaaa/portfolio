import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { I18nTitleStrategy } from './core/i18n-title.strategy';
import { PageMetaService } from './core/page-meta.service';
import { HUD_OFFSET } from './core/smooth-scroll.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    { provide: TitleStrategy, useClass: I18nTitleStrategy },
    // Keeps router anchor jumps (deep links, links from other routes) clear of the fixed HUD.
    provideAppInitializer(() => inject(ViewportScroller).setOffset([0, HUD_OFFSET])),
    // Meta description in the current language.
    provideAppInitializer(() => void inject(PageMetaService)),
  ],
};
