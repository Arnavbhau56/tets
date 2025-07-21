import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
    },
    {
    path: 'pastwin',
    loadComponent: () => import('./pages/pastwin/pastwin').then(m => m.Pastwin)
    },
    {
        path: 'incentives',
        loadComponent: () => import('./pages/incentives/incentives').then(m => m.Incentives)
    },
    {
        path: 'sponsors',
        loadComponent: () => import('./pages/sponsor/sponsor').then(m => m.SponsorComponent)
    },
    {
        path: 'tracks',
        loadComponent: () => import('./pages/tracks/tracks').then(m => m.TracksComponent)
    },
    {
        path: 'media',
        loadComponent: () => import('./pages/media/media').then(m => m.MediaComponent)
    },
    {
        path: 'structure',
        loadComponent: () => import('./pages/timeline/timeline').then(m => m.Timeline)
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.Login)
    },
    {
        path: 'reset',
        loadComponent: () => import('./pages/reset/reset').then(m => m.Reset)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [AuthGuard]
    },
    {
        path: 'form',
        loadComponent: () => import('./pages/form/form').then(m => m.Form),
        canActivate: [AuthGuard]
    },
];
