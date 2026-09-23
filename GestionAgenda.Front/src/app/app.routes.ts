import { Routes } from '@angular/router';
import { accueilGuard } from './core/guards/accueil.guard';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: 'connexion',
    loadChildren: () => import('./features/auth/auth.routes').then((module) => module.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [accueilGuard] },
      {
        path: 'demandes-rencontre',
        loadChildren: () => import('./features/demandes-rencontre/demandes-rencontre.routes').then((module) => module.DEMANDES_ROUTES),
      },
    ],
  },
];
