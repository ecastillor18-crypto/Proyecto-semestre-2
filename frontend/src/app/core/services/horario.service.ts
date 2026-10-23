import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Horario, HorarioRequest } from '../models/horario.model';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly url = `${environment.apiUrl}/api/v1/schedules`;
  constructor(private http: HttpClient) {}

  gestionar(medicoId?: number, fecha?: string): Observable<Horario[]> {
    let params = new HttpParams();
    if (medicoId) params = params.set('medicoId', medicoId);
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<Horario[]>(`${this.url}/manage`, { params });
  }
  disponibles(): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.url}/available`);
  }
  crear(payload: HorarioRequest): Observable<Horario> { return this.http.post<Horario>(this.url, payload); }
  actualizar(id: number, payload: HorarioRequest): Observable<Horario> { return this.http.put<Horario>(`${this.url}/${id}`, payload); }
  cancelar(id: number): Observable<Horario> { return this.http.patch<Horario>(`${this.url}/${id}/cancel`, {}); }
}
