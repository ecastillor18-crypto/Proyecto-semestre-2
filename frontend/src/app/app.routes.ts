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
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_PATIENT'] },
        loadChildren: () => import('./features/paciente/paciente.routes').then((m) => m.PACIENTE_ROUTES),
      },
      { path: '', pathMatch: 'full', canActivate: [inicioGuard], children: [] },
    ],
  },
  { path: '**', redirectTo: '' },
];
