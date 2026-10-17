import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'usuarios',
    loadChildren: () => import('../usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
  },
  {
    path: 'roles',
    loadChildren: () => import('../roles/roles.routes').then((m) => m.ROLES_ROUTES),
  },
  {
    path: 'medicos',
    loadChildren: () => import('../medicos/medicos.routes').then((m) => m.MEDICOS_ROUTES),
  },
  {
    path: 'especialidades',
    loadChildren: () => import('../especialidades/especialidades.routes').then((m) => m.ESPECIALIDADES_ROUTES),
  },
  {
    path: 'horarios',
    loadChildren: () => import('../horarios/horarios.routes').then((m) => m.HORARIOS_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
