import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/usuario.models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private http = inject(HttpClient);

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>('/api/roles');
  }
}
