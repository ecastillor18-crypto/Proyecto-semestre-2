import { Routes } from '@angular/router';
import { MedicosPageComponent } from './medicos-page.component';

export const MEDICOS_ROUTES: Routes = [
  {
    path: 'especialidades',
    loadComponent: () =>
      import('../especialidades/especialidades-page.component')
        .then((m) => m.EspecialidadesPageComponent)
  },
  {
    path: '',
    component: MedicosPageComponent
  }
];
