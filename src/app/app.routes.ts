import { Routes } from '@angular/router';

import { I18nKey } from './i18n/i18n.types';

// UI primitives showcase, dev builds only. `ngDevMode` (unlike isDevMode()) is replaced with
// `false` at build time, so production builds drop the route and don't even emit its chunk.
const devRoutes: Routes =
  typeof ngDevMode === 'undefined' || ngDevMode
    ? [
        {
          path: 'styleguide',
          loadComponent: () =>
            import('./styleguide/styleguide.component').then((m) => m.StyleguideComponent),
          title: 'meta.title.styleguide' satisfies I18nKey,
        },
      ]
    : [];

// Route titles are i18n keys, translated by I18nTitleStrategy.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./portfolio-page/portfolio-page.component').then((m) => m.PortfolioPageComponent),
    title: 'meta.title.home' satisfies I18nKey,
  },
  ...devRoutes,
  {
    path: '404',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'meta.title.notFound' satisfies I18nKey,
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
