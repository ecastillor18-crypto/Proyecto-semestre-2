import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidad, EspecialidadRequest } from '../models/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly url = `${environment.apiUrl}/api/especialidades`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.url);
  }

  obtener(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.url}/${id}`);
  }

  crear(payload: EspecialidadRequest): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.url, payload);
  }

  actualizar(id: number, payload: EspecialidadRequest): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.url}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
