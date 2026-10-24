import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita, DiagnosticoRequest } from '../models/cita.model';

export interface CitaCreateRequest {
  horarioId: number;
  motivo: string;
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly url = `${environment.apiUrl}/api/v1/appointments`;
  constructor(private http: HttpClient) {}

  misCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.url}/my`);
  }

  reservar(payload: CitaCreateRequest): Observable<Cita> {
    return this.http.post<Cita>(this.url, payload);
  }

  citasDoctor(fecha?: string): Observable<Cita[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<Cita[]>(`${this.url}/doctor`, { params });
  }

  registrarDiagnostico(id: number, payload: DiagnosticoRequest): Observable<Cita> {
    return this.http.put<Cita>(`${this.url}/${id}/diagnosis`, payload);
  }
}
