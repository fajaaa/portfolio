import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

import { I18nKey } from './i18n/i18n.types';

// UI primitives showcase; never registered in production builds.
const devRoutes: Routes = isDevMode()
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
