import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rol } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly url = `${environment.apiUrl}/api/roles`;
  constructor(private http: HttpClient) {}
  listar(): Observable<Rol[]> { return this.http.get<Rol[]>(this.url); }
  crear(payload: Omit<Rol, 'id'>): Observable<Rol> { return this.http.post<Rol>(this.url, payload); }
  actualizar(id: number, payload: Omit<Rol, 'id'>): Observable<Rol> { return this.http.put<Rol>(`${this.url}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
