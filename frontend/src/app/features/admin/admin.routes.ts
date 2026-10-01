import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'usuarios', loadComponent: () => import('./usuarios.component').then((m) => m.UsuariosComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
