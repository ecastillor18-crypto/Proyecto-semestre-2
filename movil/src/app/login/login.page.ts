import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonButton, IonContent, IonInput } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonInput, IonButton],
  template: `
    <ion-content class="ion-padding">
      <div class="caja">
        <h1>Citas Médicas</h1>
        <p>Inicia sesión para ver tus citas</p>

        <form [formGroup]="form" (ngSubmit)="ingresar()">
          <ion-input
            type="email"
            label="Email"
            labelPlacement="floating"
            fill="outline"
            formControlName="email"
            autocomplete="email"
          ></ion-input>
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small class="error">Ingresa un email válido</small>
          }

          <ion-input
            class="separado"
            type="password"
            label="Contraseña"
            labelPlacement="floating"
            fill="outline"
            formControlName="password"
            autocomplete="current-password"
          ></ion-input>
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="error">La contraseña es obligatoria</small>
          }

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <ion-button expand="block" type="submit" class="boton" [disabled]="cargando()">
            {{ cargando() ? 'Ingresando...' : 'Ingresar' }}
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .caja { max-width: 400px; margin: 15vh auto 0; }
    h1 { margin-bottom: 4px; }
    p { color: #666; margin-top: 0; }
    .separado { margin-top: 16px; }
    .boton { margin-top: 24px; }
    .error { color: #c1121f; font-size: 13px; display: block; margin-top: 4px; }
  `],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ingresar(): void {
    // si el formulario esta mal no mando nada
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(this.armarMensaje(e));
      },
    });
  }

  // convierto el error en un mensaje para el paciente
  private armarMensaje(e: unknown): string {
    if (e instanceof Error && e.message === 'SOLO_PACIENTES') {
      return 'Esta aplicación es solo para pacientes';
    }
    if (e instanceof HttpErrorResponse) {
      if (e.status === 401) return 'Email o contraseña incorrectos';
      if (e.status === 0) return 'No se pudo conectar con el servidor';
    }
    return 'Ocurrió un error, intenta de nuevo';
  }
}
