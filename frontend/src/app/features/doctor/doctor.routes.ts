import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: 'agenda',
    loadChildren: () => import('../horarios/horarios.routes').then((m) => m.HORARIOS_ROUTES),
  },
  {
    path: 'citas',
    loadChildren: () => import('../consultas/consultas.routes').then((m) => m.CONSULTAS_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'agenda' },
];
