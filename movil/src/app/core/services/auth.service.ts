import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession, LoginRequest, LoginResponse } from '../models/auth.models';

const CLAVE_SESION = 'sesion_paciente';
export const ROL_PACIENTE = 'ROLE_PATIENT';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // la sesion en memoria, uso signal para que las pantallas se actualicen solas
  private _sesion = signal<AuthSession | null>(null);
  readonly sesion = this._sesion.asReadonly();

  // para leer lo guardado una sola vez
  private carga: Promise<void> | null = null;

  login(datos: LoginRequest): Observable<AuthSession> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos).pipe(
      map((resp) => this.armarSesion(resp, datos.email)),
      switchMap((sesion) => {
        // la app movil es solo para pacientes, si es otro rol no guardo nada
        if (sesion.role !== ROL_PACIENTE) {
          return throwError(() => new Error('SOLO_PACIENTES'));
        }
        return from(this.guardarSesion(sesion)).pipe(map(() => sesion));
      })
    );
  }

  // lee la sesion guardada en el telefono (solo la primera vez)
  cargarSesion(): Promise<void> {
    if (!this.carga) {
      this.carga = this.leerSesionGuardada();
    }
    return this.carga;
  }

  async obtenerToken(): Promise<string | null> {
    await this.cargarSesion();
    return this._sesion()?.token ?? null;
  }

  // lo usan los guards para saber si dejan pasar
  async estaLogueado(): Promise<boolean> {
    await this.cargarSesion();
    const s = this._sesion();
    if (!s) return false;

    // si el rol no es paciente o el token ya vencio, limpio todo
    if (s.role !== ROL_PACIENTE || this.tokenVencido(s.token)) {
      await this.limpiarSesion();
      return false;
    }
    return true;
  }

  async logout(): Promise<void> {
    await this.limpiarSesion();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private armarSesion(resp: LoginResponse, emailEscrito: string): AuthSession {
    return {
      token: resp.token,
      role: resp.role,
      userId: resp.userId ?? resp.id ?? null,
      email: resp.email ?? emailEscrito,
    };
  }

  private async guardarSesion(sesion: AuthSession): Promise<void> {
    await Preferences.set({ key: CLAVE_SESION, value: JSON.stringify(sesion) });
    this._sesion.set(sesion);
  }

  private async leerSesionGuardada(): Promise<void> {
    const { value } = await Preferences.get({ key: CLAVE_SESION });
    if (!value) return;
    try {
      this._sesion.set(JSON.parse(value) as AuthSession);
    } catch {
      // si lo guardado esta dañado lo borro
      await Preferences.remove({ key: CLAVE_SESION });
    }
  }

  private async limpiarSesion(): Promise<void> {
    await Preferences.remove({ key: CLAVE_SESION });
    this._sesion.set(null);
  }

  // leo el exp del jwt para saber si ya vencio, no verifica la firma eso lo hace spring
  private tokenVencido(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch {
      return true;
    }
  }
}
