import { Routes } from '@angular/router';
import { authGuard, guestGuard, inicioGuard, roleGuard } from './core/guards/auth.guards';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./features/auth/no-autorizado/no-autorizado.component').then((m) => m.NoAutorizadoComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'doctor',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_DOCTOR'] },
        loadChildren: () => import('./features/doctor/doctor.routes').then((m) => m.DOCTOR_ROUTES),
      },

      // Alias de compatibilidad para conservar las rutas del proyecto completo original.
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
      },
      {
        path: 'roles',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'medicos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/medicos/medicos.routes').then((m) => m.MEDICOS_ROUTES),
      },
      {
        path: 'especialidades',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] },
        loadChildren: () => import('./features/especialidades/especialidades.routes').then((m) => m.ESPECIALIDADES_ROUTES),
      },
      {
        path: 'horarios',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DOCTOR'] },
        loadChildren: () => import('./features/horarios/horarios.routes').then((m) => m.HORARIOS_ROUTES),
      },
      {
        path: 'consultas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_DOCTOR'] },
        loadChildren: () => import('./features/consultas/consultas.routes').then((m) => m.CONSULTAS_ROUTES),
      },
      { path: '', pathMatch: 'full', canActivate: [inicioGuard], children: [] },
    ],
  },
  { path: '**', redirectTo: '' },
];
