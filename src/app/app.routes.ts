import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
    canActivate: [authGuard],
  },
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor').then((m) => m.Editor),
    canActivate: [authGuard],
  },
  {
    path: 'editor/:slug',
    loadComponent: () => import('./features/editor/editor').then((m) => m.Editor),
    canActivate: [authGuard],
  },
  {
    path: 'article/:slug',
    loadComponent: () => import('./features/article/article-page').then((m) => m.ArticlePage),
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'profile/:username/favorites',
    loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
    data: { favoritesOnly: true },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
