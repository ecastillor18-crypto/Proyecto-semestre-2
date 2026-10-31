import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    // todo lo que esta dentro de tabs necesita sesion
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'buscar-medico',
        loadComponent: () =>
          import('./pages/buscar-medico/buscar-medico.page').then((m) => m.BuscarMedicoPage),
      },
      {
        // detalle del medico, recibe el medicoId por la url
        path: 'buscar-medico/medico/:id',
        loadComponent: () =>
          import('./pages/detalle-medico/detalle-medico.page').then((m) => m.DetalleMedicoPage),
      },
      {
        path: 'mis-citas',
        loadComponent: () => import('./pages/mis-citas/mis-citas.page').then((m) => m.MisCitasPage),
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
