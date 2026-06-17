import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./portfolio-page/portfolio-page.component').then((m) => m.PortfolioPageComponent),
    title: 'Kenan | Portfolio',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Page not found',
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
