import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  { path: 'agenda', loadComponent: () => import('./agenda.component').then((m) => m.AgendaComponent) },
  { path: 'citas', loadComponent: () => import('./citas.component').then((m) => m.CitasComponent) },
  { path: '', pathMatch: 'full', redirectTo: 'agenda' },
];
