import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Doctor, Especialidad } from '../models/doctor.models';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/doctors`;

  // guardo la ultima lista para que el detalle no tenga que volver a pedirla
  private cache: Doctor[] = [];

  // GET /api/v1/doctors  o  GET /api/v1/doctors?especialidadId=3
  listar(especialidadId?: number | null): Observable<Doctor[]> {
    let params = new HttpParams();
    if (especialidadId != null) {
      params = params.set('especialidadId', especialidadId);
    }
    return this.http.get<Doctor[]>(this.url, { params }).pipe(
      map((lista) => lista.map((d) => ({ ...d, especialidades: d.especialidades ?? [] }))),
      tap((lista) => this.actualizarCache(lista))
    );
  }

  // no existe GET /doctors/{id}, asi que busco en lo ya cargado
  obtenerEnCache(id: number): Doctor | undefined {
    return this.cache.find((d) => d.id === id);
  }

  // saco las especialidades sin repetir a partir de la lista de medicos
  extraerEspecialidades(doctores: Doctor[]): Especialidad[] {
    const unicas = new Map<number, Especialidad>();
    for (const d of doctores) {
      for (const e of d.especialidades) {
        unicas.set(e.id, e);
      }
    }
    return [...unicas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  private actualizarCache(lista: Doctor[]): void {
    // mezclo para no perder medicos de una lista sin filtro cuando llega una filtrada
    const porId = new Map(this.cache.map((d) => [d.id, d]));
    for (const d of lista) porId.set(d.id, d);
    this.cache = [...porId.values()];
  }
}
