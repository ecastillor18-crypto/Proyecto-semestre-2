import { Routes } from '@angular/router';

export const PACIENTE_ROUTES: Routes = [
  { path: 'citas', loadComponent: () => import('./citas.component').then((m) => m.CitasComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'citas' },
];
