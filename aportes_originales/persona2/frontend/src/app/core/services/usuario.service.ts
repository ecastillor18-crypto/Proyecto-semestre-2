import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioPayload } from '../models/usuario.models';

const API = '/api/usuarios'; // el proxy lo manda a localhost:8080

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(API);
  }

  crear(datos: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(API, datos);
  }

  actualizar(id: number, datos: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${API}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
