import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly url = `${environment.apiUrl}/api/usuarios`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Usuario[]> { return this.http.get<Usuario[]>(this.url); }
  obtener(id: number): Observable<Usuario> { return this.http.get<Usuario>(`${this.url}/${id}`); }
  crear(payload: UsuarioRequest): Observable<Usuario> { return this.http.post<Usuario>(this.url, payload); }
  actualizar(id: number, payload: UsuarioRequest): Observable<Usuario> { return this.http.put<Usuario>(`${this.url}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
