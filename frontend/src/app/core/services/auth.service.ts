import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Rol, Sesion } from '../models/auth.models';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/api/v1`;
const CLAVE = 'citas_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _sesion = signal<Sesion | null>(this.leerSesion());

  readonly sesion = this._sesion.asReadonly();
  readonly rol = computed<Rol | null>(() => this._sesion()?.role ?? null);
  readonly token = computed(() => this._sesion()?.token ?? null);
  // Se calcula al consultar, no se deja cacheado en un computed():
  // Date.now() cambia con el tiempo, pero no es una dependencia reactiva.
  estaAutenticado(): boolean {
    const s = this._sesion();
    return !!s && !this.tokenExpirado(s.token);
  }

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

  rutaInicio(rol: Rol | null = this.rol()): string {
    switch (rol) {
      case 'ROLE_ADMIN': return '/admin';
      case 'ROLE_DOCTOR': return '/doctor';
      case 'ROLE_PATIENT': return '/no-autorizado';
      default: return '/login';
    }
  }

  // Compatibilidad con los componentes del proyecto completo.
  get role(): Rol | null {
    return this.rol();
  }

  get isAuthenticated(): boolean {
    return this.estaAutenticado();
  }

  homeUrl(): string {
    return this.rutaInicio();
  }

  private guardarSesion(r: LoginResponse, emailIngresado: string): void {
    const u = r.usuario;
    const nombre = [u?.nombre ?? r.nombre, u?.apellido ?? r.apellido].filter(Boolean).join(' ');
    const sesion: Sesion = {
      token: r.token,
      role: r.role,
      id: u?.id ?? r.id ?? r.userId,
      nombre: nombre || r.email || emailIngresado,
      email: u?.email ?? r.email ?? emailIngresado,
    };
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (!raw) return null;
      const sesion = JSON.parse(raw) as Sesion;
      if (!sesion.token || this.tokenExpirado(sesion.token)) {
        localStorage.removeItem(CLAVE);
        return null;
      }
      return sesion;
    } catch {
      localStorage.removeItem(CLAVE);
      return null;
    }
  }

  private tokenExpirado(token: string): boolean {
    try {
      const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const conPadding = parte.padEnd(Math.ceil(parte.length / 4) * 4, '=');
      const payload = JSON.parse(atob(conPadding));
      return payload.exp ? payload.exp * 1000 <= Date.now() : false;
    } catch {
      return true;
    }
  }
}
