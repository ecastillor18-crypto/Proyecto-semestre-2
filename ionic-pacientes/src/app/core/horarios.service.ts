import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HorarioDisponible } from './models';

// FASE 4 — PERSONA 3
// Obtiene disponibilidad desde el backend (no guarda citas).
@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly url = `${environment.apiUrl}/api/v1/schedules/available`;

  constructor(private http: HttpClient) {}

  disponibles(medicoId: number, fecha: string): Observable<HorarioDisponible[]> {
    const params = new HttpParams()
      .set('medicoId', medicoId)
      .set('fecha', fecha);
    return this.http.get<HorarioDisponible[]>(this.url, { params });
  }
}
