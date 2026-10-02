import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DoctorPublico,
  MedicoAdmin,
  MedicoApi,
  MedicoRequest,
  UsuarioDoctorApi
} from '../models/medico.model';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly adminUrl = `${environment.apiUrl}/api/medicos`;
  private readonly usuariosUrl = `${environment.apiUrl}/api/usuarios`;
  private readonly publicUrl = `${environment.apiUrl}/api/v1/doctors`;

  constructor(private http: HttpClient) {}

  listarAdmin(): Observable<MedicoAdmin[]> {
    return this.http.get<MedicoApi[]>(this.adminUrl).pipe(
      map((medicos) => medicos.map((medico) => this.toAdmin(medico)))
    );
  }

  obtener(id: number): Observable<MedicoAdmin> {
    return this.http.get<MedicoApi>(`${this.adminUrl}/${id}`).pipe(
      map((medico) => this.toAdmin(medico))
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

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  /**
   * Reutiliza /api/usuarios de la Fase 2, pero la Persona 3 solo toma
   * usuarios activos con ROLE_DOCTOR para mostrarlos en el selector.
   */
  listarUsuariosDoctor(): Observable<UsuarioDoctorApi[]> {
    return this.http.get<UsuarioDoctorApi[]>(this.usuariosUrl).pipe(
      map((usuarios) =>
        usuarios.filter(
          (usuario) => usuario.activo && usuario.rol?.nombreRol === 'ROLE_DOCTOR'
        )
      )
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
