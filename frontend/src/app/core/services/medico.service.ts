import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorPublico, MedicoAdmin, MedicoRequest } from '../models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly adminUrl = `${environment.apiUrl}/api/medicos`;
  private readonly publicUrl = `${environment.apiUrl}/api/v1/doctors`;
  constructor(private http: HttpClient) {}

  listarAdmin(): Observable<MedicoAdmin[]> { return this.http.get<MedicoAdmin[]>(this.adminUrl); }
  crear(payload: MedicoRequest): Observable<MedicoAdmin> { return this.http.post<MedicoAdmin>(this.adminUrl, payload); }
  actualizar(id: number, payload: MedicoRequest): Observable<MedicoAdmin> { return this.http.put<MedicoAdmin>(`${this.adminUrl}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.adminUrl}/${id}`); }

  listarPublicos(especialidadId?: number): Observable<DoctorPublico[]> {
    let params = new HttpParams();
    if (especialidadId) params = params.set('especialidadId', especialidadId);
    return this.http.get<DoctorPublico[]>(this.publicUrl, { params });
  }

  miPerfil(): Observable<DoctorPublico> { return this.http.get<DoctorPublico>(`${this.publicUrl}/me`); }
}
