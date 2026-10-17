import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';
import { CitaPaciente } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaPacienteService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.apiBaseUrl}/api/v1/appointments`;

  /**
   * GET /api/v1/appointments/my
   * El paciente NO envía pacienteId. Spring lo obtiene del JWT.
   * la integración principal debe proveer el AuthInterceptor que agregue Authorization: Bearer <JWT>.
   */
  misCitas(): Observable<CitaPaciente[]> {
    return this.http.get<CitaPaciente[]>(`${this.endpoint}/my`);
  }

  /** GET /api/v1/appointments/my-history */
  historial(): Observable<CitaPaciente[]> {
    return this.http.get<CitaPaciente[]>(`${this.endpoint}/my-history`);
  }

  /** PATCH /api/v1/appointments/{id}/cancel */
  cancelar(citaId: number): Observable<CitaPaciente> {
    return this.http.patch<CitaPaciente>(`${this.endpoint}/${citaId}/cancel`, {});
  }

  /**
   * El backend actual no expone GET /appointments/my/{id}.
   * Para el detalle se busca la cita dentro de los endpoints permitidos al paciente.
   */
  detallePropio(citaId: number): Observable<CitaPaciente | null> {
    return this.misCitas().pipe(
      map(citas => citas.find(cita => cita.id === citaId) ?? null),
      switchMap(cita => {
        if (cita) return of(cita);
        return this.historial().pipe(
          map(citas => citas.find(item => item.id === citaId) ?? null),
          catchError(() => of(null)),
        );
      }),
    );
  }
}
