import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especialidad } from '../models/especialidad.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly url = `${environment.apiUrl}/api/especialidades`;

  constructor(private http: HttpClient) {}

  /** Primer avance: solamente consulta el catálogo. */
  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.url);
  }
}
