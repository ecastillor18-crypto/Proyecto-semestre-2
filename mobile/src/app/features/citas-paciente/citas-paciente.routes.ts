import { Routes } from '@angular/router';

/**
 * Rutas listas para montar dentro de la navegación protegida de ROLE_PATIENT.
 * la integración principal puede cargar estas rutas como hijas de su área privada del paciente.
 */
export const CITAS_PACIENTE_ROUTES: Routes = [
  {
    path: 'mis-citas',
    loadComponent: () =>
      import('./pages/mis-citas/mis-citas.page').then(m => m.MisCitasPage),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/historial/historial.page').then(m => m.HistorialPage),
  },
  {
    path: 'citas/:id',
    loadComponent: () =>
      import('./pages/detalle-cita/detalle-cita.page').then(m => m.DetalleCitaPage),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'mis-citas',
  },
];
