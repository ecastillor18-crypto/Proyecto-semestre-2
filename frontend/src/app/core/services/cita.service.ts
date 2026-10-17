import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cita, DiagnosticoRequest } from '../models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private readonly url = `${environment.apiUrl}/api/v1/appointments`;
  constructor(private http: HttpClient) {}

  citasDoctor(fecha?: string): Observable<Cita[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<Cita[]>(`${this.url}/doctor`, { params });
  }

  registrarDiagnostico(id: number, payload: DiagnosticoRequest): Observable<Cita> {
    return this.http.put<Cita>(`${this.url}/${id}/diagnosis`, payload);
  }
}
