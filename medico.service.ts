import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorPublico, MedicoAdmin, MedicoApi, MedicoRequest } from '../models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly adminUrl = `${environment.apiUrl}/api/medicos`;
  private readonly publicUrl = `${environment.apiUrl}/api/v1/doctors`;

  constructor(private http: HttpClient) {}

  listarAdmin(): Observable<MedicoAdmin[]> {
    return this.http.get<MedicoApi[]>(this.adminUrl).pipe(
      map((medicos) => medicos.map((medico) => this.toAdmin(medico)))
    );
  }

  crear(payload: MedicoRequest): Observable<MedicoAdmin> {
    return this.http.post<MedicoApi>(this.adminUrl, payload).pipe(
      map((medico) => this.toAdmin(medico))
    );
  }

  actualizar(id: number, payload: MedicoRequest): Observable<MedicoAdmin> {
    return this.http.put<MedicoApi>(`${this.adminUrl}/${id}`, payload).pipe(
      map((medico) => this.toAdmin(medico))
    );
  }

  listarPublicos(especialidadId?: number): Observable<DoctorPublico[]> {
    let params = new HttpParams();
    if (especialidadId) {
      params = params.set('especialidadId', especialidadId);
    }
    return this.http.get<DoctorPublico[]>(this.publicUrl, { params });
  }

  private toAdmin(medico: MedicoApi): MedicoAdmin {
    return {
      id: medico.id,
      usuarioId: medico.usuario.id,
      nombreCompleto: `${medico.usuario.nombre} ${medico.usuario.apellido}`.trim(),
      email: medico.usuario.email,
      numeroColegiado: medico.numeroColegiado,
      aniosExperiencia: medico.aniosExperiencia,
      biografia: medico.biografia,
      especialidades: medico.especialidades ?? []
    };
  }
}
