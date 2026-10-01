import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorPublico, MedicoAdmin } from '../models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly adminUrl = `${environment.apiUrl}/api/medicos`;
  private readonly publicUrl = `${environment.apiUrl}/api/v1/doctors`;

  constructor(private http: HttpClient) {}

  /** Lista los perfiles médicos para el panel administrativo. */
  listarAdmin(): Observable<MedicoAdmin[]> {
    return this.http.get<MedicoAdmin[]>(this.adminUrl);
  }

  /**
   * Consulta el catálogo público y permite filtrar por especialidad.
   * En este avance todavía no se implementan crear/editar/eliminar.
   */
  listarPublicos(especialidadId?: number): Observable<DoctorPublico[]> {
    let params = new HttpParams();

    if (especialidadId) {
      params = params.set('especialidadId', especialidadId);
    }

    return this.http.get<DoctorPublico[]>(this.publicUrl, { params });
  }
}
