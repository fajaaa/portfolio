import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

// UI primitives showcase; never registered in production builds.
const devRoutes: Routes = isDevMode()
  ? [
      {
        path: 'styleguide',
        loadComponent: () =>
          import('./styleguide/styleguide.component').then((m) => m.StyleguideComponent),
        title: 'Styleguide',
      },
    ]
  : [];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./portfolio-page/portfolio-page.component').then((m) => m.PortfolioPageComponent),
    title: 'Kenan Fajic',
  },
  ...devRoutes,
  {
    path: '404',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page not found',
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
