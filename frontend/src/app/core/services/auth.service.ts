import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Rol, Sesion } from '../models/auth.models';

const API = '/api/v1'; //el proxy lo manda a localhost:8080
const CLAVE = 'citas_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _sesion = signal<Sesion | null>(this.leerSesion());

  readonly sesion = this._sesion.asReadonly();
  readonly rol = computed<Rol | null>(() => this._sesion()?.role ?? null);
  readonly token = computed(() => this._sesion()?.token ?? null);
  readonly estaAutenticado = computed(() => {
    const s = this._sesion();
    return !!s && !this.tokenExpirado(s.token);
  });

  login(creds: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, creds).pipe(
      tap((resp) => this.guardarSesion(resp, creds.email))
    );
  }

  logout(porExpiracion = false): void {
    localStorage.removeItem(CLAVE);
    this._sesion.set(null);
    this.router.navigate(['/login'], porExpiracion ? { queryParams: { expirada: 1 } } : {});
  }

  tieneRol(roles: Rol[]): boolean {
    const r = this.rol();
    return !!r && roles.includes(r);
  }

  //a donde mando a cada rol despues del login
  rutaInicio(rol: Rol | null = this.rol()): string {
    switch (rol) {
      case 'ROLE_ADMIN': return '/admin';
      case 'ROLE_DOCTOR': return '/doctor';
      case 'ROLE_PATIENT': return '/paciente';
      default: return '/login';
    }
  }

  private guardarSesion(r: LoginResponse, emailIngresado: string): void {
    const u = r.usuario;
    const nombre = [u?.nombre ?? r.nombre, u?.apellido ?? r.apellido].filter(Boolean).join(' ');
    const sesion: Sesion = {
      token: r.token,
      role: r.role,
      id: u?.id ?? r.id,
      nombre: nombre || emailIngresado,
      email: u?.email ?? r.email ?? emailIngresado,
    };
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const raw = localStorage.getItem(CLAVE);
      return raw ? (JSON.parse(raw) as Sesion) : null;
    } catch {
      return null;
    }
  }

  //leo el exp del jwt para saber si ya vencio 
  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch {
      return true;
    }
  }
}
