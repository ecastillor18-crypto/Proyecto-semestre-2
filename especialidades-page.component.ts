import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Especialidad, EspecialidadRequest } from '../../core/models/especialidad.model';
import { EspecialidadService } from '../../core/services/especialidad.service';

@Component({
  selector: 'app-especialidades-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <span class="eyebrow">CATÁLOGO MÉDICO</span>
          <h1>Especialidades</h1>
          <p>Catálogo utilizado para clasificar y asignar especialidades a los médicos.</p>
        </div>
        <div class="header-actions">
          <a class="btn btn-secondary" routerLink="/medicos">Volver a médicos</a>
          <button class="btn btn-primary" type="button" (click)="nueva()">+ Nueva especialidad</button>
        </div>
      </header>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (errorMessage) {
        <div class="alert error">{{ errorMessage }}</div>
      }

      <div class="content-grid">
        <section class="card">
          <div class="card-title">
            <h2>Especialidades registradas</h2>
            <span>{{ especialidades.length }} registro(s)</span>
          </div>

          @if (cargando) {
            <p class="empty">Cargando especialidades...</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (especialidad of especialidades; track especialidad.id) {
                    <tr>
                      <td><strong>{{ especialidad.nombre }}</strong></td>
                      <td>{{ especialidad.descripcion || 'Sin descripción' }}</td>
                      <td class="actions">
                        <button type="button" class="link-btn" (click)="editar(especialidad)">Editar</button>
                        <button
                          type="button"
                          class="link-btn danger"
                          [disabled]="eliminandoId === especialidad.id"
                          (click)="eliminar(especialidad)">
                          {{ eliminandoId === especialidad.id ? 'Eliminando...' : 'Eliminar' }}
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3" class="empty">No hay especialidades registradas.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <section class="card form-card">
          <div class="card-title">
            <h2>{{ editingId ? 'Editar especialidad' : 'Nueva especialidad' }}</h2>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()">
            <label for="nombre">Nombre</label>
            <input id="nombre" type="text" maxlength="80" formControlName="nombre">
            @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
              <small class="field-error">El nombre de la especialidad es obligatorio.</small>
            }

            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows="5"
              maxlength="255"
              formControlName="descripcion"
              placeholder="Descripción breve de la especialidad"></textarea>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="nueva()">Limpiar</button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar') }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  `,
  styles: [`
    :host { display:block; }
    .page-shell { display:grid; gap:1rem; }
    .page-header { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; flex-wrap:wrap; }
    .page-header h1 { margin:.15rem 0; }
    .page-header p { margin:0; opacity:.72; }
    .eyebrow { font-size:.75rem; letter-spacing:.12em; font-weight:700; opacity:.65; }
    .header-actions, .form-actions, .actions { display:flex; gap:.65rem; flex-wrap:wrap; }
    .content-grid { display:grid; grid-template-columns:minmax(0, 1.45fr) minmax(300px, .75fr); gap:1rem; align-items:start; }
    .card { border:1px solid #d9dee8; border-radius:14px; padding:1rem; background:#fff; }
    .card-title { display:flex; justify-content:space-between; align-items:center; gap:.75rem; margin-bottom:.8rem; }
    .card-title h2 { margin:0; font-size:1.05rem; }
    .table-wrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { text-align:left; padding:.75rem .55rem; border-bottom:1px solid #eceff4; vertical-align:top; }
    .form-card form { display:grid; gap:.55rem; }
    input, textarea { width:100%; box-sizing:border-box; border:1px solid #cbd3df; border-radius:9px; padding:.68rem .75rem; font:inherit; }
    textarea { resize:vertical; }
    .btn, .link-btn { cursor:pointer; font:inherit; }
    .btn { border:0; border-radius:9px; padding:.65rem .9rem; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
    .btn-primary { background:#2457d6; color:white; }
    .btn-secondary { background:#eef2f8; color:#25324a; }
    .link-btn { border:0; background:transparent; padding:.2rem; text-decoration:underline; }
    .danger, .field-error { color:#b42318; }
    .alert { border-radius:10px; padding:.7rem .85rem; }
    .success { background:#eaf8ef; color:#176b3a; }
    .alert.error { background:#fff0ef; color:#b42318; }
    .field-error { font-size:.82rem; }
    .empty { text-align:center; padding:1.2rem; opacity:.65; }
    @media (max-width: 900px) { .content-grid { grid-template-columns:1fr; } }
  `]
})
export class EspecialidadesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  especialidades: Especialidad[] = [];
  editingId: number | null = null;
  eliminandoId: number | null = null;
  cargando = false;
  guardando = false;
  mensaje = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    descripcion: ['', Validators.maxLength(255)]
  });

  constructor(private especialidadService: EspecialidadService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.errorMessage = '';

    this.especialidadService.listar()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (especialidades) => (this.especialidades = especialidades),
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error, 'No fue posible cargar las especialidades.');
        }
      });
  }

  nueva(): void {
    this.editingId = null;
    this.errorMessage = '';
    this.form.reset({ nombre: '', descripcion: '' });
  }

  editar(especialidad: Especialidad): void {
    this.editingId = especialidad.id;
    this.errorMessage = '';
    this.form.reset({
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion ?? ''
    });
  }

  guardar(): void {
    this.mensaje = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Revisa los datos de la especialidad.';
      return;
    }

    const values = this.form.getRawValue();
    const payload: EspecialidadRequest = {
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim() || null
    };

    this.guardando = true;
    const request$ = this.editingId
      ? this.especialidadService.actualizar(this.editingId, payload)
      : this.especialidadService.crear(payload);

    request$.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.mensaje = this.editingId
          ? 'Especialidad actualizada correctamente.'
          : 'Especialidad creada correctamente.';
        this.nueva();
        this.cargar();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'No se pudo guardar la especialidad. Verifica que el nombre no esté repetido.'
        );
      }
    });
  }

  eliminar(especialidad: Especialidad): void {
    const confirmado = confirm(`¿Eliminar la especialidad "${especialidad.nombre}"?`);
    if (!confirmado) {
      return;
    }

    this.mensaje = '';
    this.errorMessage = '';
    this.eliminandoId = especialidad.id;

    this.especialidadService.eliminar(especialidad.id)
      .pipe(finalize(() => (this.eliminandoId = null)))
      .subscribe({
        next: () => {
          this.mensaje = 'Especialidad eliminada correctamente.';
          if (this.editingId === especialidad.id) {
            this.nueva();
          }
          this.cargar();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No se puede eliminar la especialidad si está relacionada con médicos.'
          );
        }
      });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string; error?: string } | null;
    return body?.message || body?.error || fallback;
  }
}
