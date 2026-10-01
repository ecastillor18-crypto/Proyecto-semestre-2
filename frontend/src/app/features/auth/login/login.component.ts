import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="contenedor">
      <form class="tarjeta" [formGroup]="form" (ngSubmit)="ingresar()">
        <h1>Sistema de Citas Médicas</h1>
        <p class="sub">Inicia sesión para continuar</p>

        @if (expirada) {
          <p class="aviso">Tu sesión expiró, ingresa de nuevo.</p>
        }

        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" autocomplete="username" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <small class="error">Ingresa un email válido</small>
        }

        <label for="password">Contraseña</label>
        <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <small class="error">La contraseña es obligatoria</small>
        }

        @if (error()) {
          <p class="error caja">{{ error() }}</p>
        }

        <button type="submit" [disabled]="cargando()">
          {{ cargando() ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .contenedor { min-height: 100vh; display: grid; place-items: center; background: #eef2f7; }
    .tarjeta { width: 360px; background: #fff; padding: 2rem; border-radius: 12px;
               box-shadow: 0 4px 20px rgba(0,0,0,.08); display: flex; flex-direction: column; gap: .4rem; }
    h1 { font-size: 1.3rem; margin: 0; color: #1d3557; }
    .sub { margin: 0 0 1rem; color: #667; font-size: .9rem; }
    label { font-size: .85rem; font-weight: 600; margin-top: .6rem; }
    input { padding: .6rem; border: 1px solid #ccd; border-radius: 6px; font-size: 1rem; }
    button { margin-top: 1.2rem; padding: .7rem; border: 0; border-radius: 6px;
             background: #1d3557; color: #fff; font-size: 1rem; cursor: pointer; }
    button:disabled { opacity: .6; cursor: default; }
    .error { color: #c1121f; font-size: .8rem; }
    .caja { background: #fde8ea; padding: .5rem; border-radius: 6px; margin: .6rem 0 0; }
    .aviso { background: #fff4d6; padding: .5rem; border-radius: 6px; font-size: .85rem; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cargando = signal(false);
  error = signal('');
  expirada = !!this.route.snapshot.queryParamMap.get('expirada');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (resp) => {
        //si venia de una ruta protegida lo regreso ahi, si no a su zona
        const destino = this.route.snapshot.queryParamMap.get('returnUrl') || this.auth.rutaInicio(resp.role);
        this.router.navigateByUrl(destino);
      },
      error: (e: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          e.status === 401 ? 'Email o contraseña incorrectos'
          : e.status === 0 ? 'No se pudo conectar con el servidor'
          : 'Ocurrió un error, intenta de nuevo'
        );
      },
    });
  }
}
