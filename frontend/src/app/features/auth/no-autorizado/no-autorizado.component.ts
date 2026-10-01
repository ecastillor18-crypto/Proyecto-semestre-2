import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center; padding:4rem 1rem">
      <h1>403 - Acceso denegado</h1>
      <p>No tienes permisos para ver esta página.</p>
      <a [routerLink]="auth.rutaInicio()">Volver a mi zona</a>
    </div>
  `,
})
export class NoAutorizadoComponent {
  auth = inject(AuthService);
}
