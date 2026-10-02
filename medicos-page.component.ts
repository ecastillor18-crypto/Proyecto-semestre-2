import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin } from 'rxjs';
import { Especialidad } from '../../core/models/especialidad.model';
import {
  MedicoAdmin,
  MedicoRequest,
  UsuarioDoctorApi
} from '../../core/models/medico.model';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { MedicoService } from '../../core/services/medico.service';

@Component({
  selector: 'app-medicos-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <span class="eyebrow">PERSONAL MÉDICO</span>
          <h1>Médicos</h1>
          <p>Administración de perfiles profesionales y especialidades asignadas.</p>
        </div>
        <div class="header-actions">
          <a class="btn btn-secondary" routerLink="/medicos/especialidades">Especialidades</a>
          <button type="button" class="btn btn-primary" (click)="nuevoMedico()">
            + Registrar médico
          </button>
        </div>
      </header>

      @if (mensaje) {
        <div class="alert success">{{ mensaje }}</div>
      }
      @if (errorMessage) {
        <div class="alert error">{{ errorMessage }}</div>
      }

      <div class="content-grid">
        <section class="card table-card">
          <div class="card-title">
            <h2>Perfiles médicos</h2>
            <span>{{ medicos.length }} registro(s)</span>
          </div>

          @if (cargando) {
            <p class="empty">Cargando médicos...</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Médico</th>
                    <th>Colegiado</th>
                    <th>Experiencia</th>
                    <th>Especialidades</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (medico of medicos; track medico.id) {
                    <tr>
                      <td>
                        <strong>{{ medico.nombreCompleto }}</strong>
                        <small>{{ medico.email }}</small>
                      </td>
                      <td>{{ medico.numeroColegiado }}</td>
                      <td>{{ medico.aniosExperiencia }} años</td>
                      <td>
                        <div class="chips">
                          @for (especialidad of medico.especialidades; track especialidad.id) {
                            <span class="chip">{{ especialidad.nombre }}</span>
                          } @empty {
                            <span class="muted">Sin especialidades</span>
                          }
                        </div>
                      </td>
                      <td class="actions">
                        <button type="button" class="link-btn" (click)="editarMedico(medico)">
                          Editar
                        </button>
                        <button
                          type="button"
                          class="link-btn danger"
                          [disabled]="eliminandoId === medico.id"
                          (click)="eliminarMedico(medico)">
                          {{ eliminandoId === medico.id ? 'Eliminando...' : 'Eliminar' }}
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="empty">No hay médicos registrados.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <section class="card form-card">
          <div class="card-title">
            <h2>{{ editingId ? 'Editar médico' : 'Registrar médico' }}</h2>
          </div>

          <form [formGroup]="form" (ngSubmit)="guardar()">
            <label for="usuarioId">Usuario con ROLE_DOCTOR</label>
            <select id="usuarioId" formControlName="usuarioId">
              <option [ngValue]="0">Seleccione un doctor...</option>
              @for (usuario of usuariosDoctorDisponibles; track usuario.id) {
                <option [ngValue]="usuario.id">
                  {{ usuario.nombre }} {{ usuario.apellido }} — {{ usuario.email }}
                </option>
              }
            </select>
            @if (form.controls.usuarioId.touched && form.controls.usuarioId.invalid) {
              <small class="field-error">Selecciona un usuario con rol doctor.</small>
            }
            @if (usuariosDoctorDisponibles.length === 0 && !editingId) {
              <small class="hint">No hay usuarios ROLE_DOCTOR libres para crear otro perfil.</small>
            }

            <label for="numeroColegiado">Número de colegiado</label>
            <input
              id="numeroColegiado"
              type="text"
              maxlength="30"
              formControlName="numeroColegiado"
              placeholder="Ejemplo: COL-12345">
            @if (form.controls.numeroColegiado.touched && form.controls.numeroColegiado.invalid) {
              <small class="field-error">El número de colegiado es obligatorio.</small>
            }

            <label for="aniosExperiencia">Años de experiencia</label>
            <input
              id="aniosExperiencia"
              type="number"
              min="0"
              formControlName="aniosExperiencia">
            @if (form.controls.aniosExperiencia.touched && form.controls.aniosExperiencia.invalid) {
              <small class="field-error">Ingresa un número válido mayor o igual a cero.</small>
            }

            <label>Especialidades</label>
            <div class="checkbox-grid">
              @for (especialidad of especialidades; track especialidad.id) {
                <label class="check-row">
                  <input
                    type="checkbox"
                    [checked]="especialidadSeleccionada(especialidad.id)"
                    (change)="alternarEspecialidad(especialidad.id)">
                  <span>{{ especialidad.nombre }}</span>
                </label>
              } @empty {
                <small class="hint">Primero debes registrar al menos una especialidad.</small>
              }
            </div>
            @if (especialidadesTouched && selectedEspecialidades.length === 0) {
              <small class="field-error">Selecciona al menos una especialidad.</small>
            }

            <label for="biografia">Biografía</label>
            <textarea
              id="biografia"
              rows="5"
              formControlName="biografia"
              placeholder="Información profesional del médico"></textarea>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="nuevoMedico()">
                Limpiar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (editingId ? 'Actualizar médico' : 'Guardar médico') }}
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
    .content-grid { display:grid; grid-template-columns:minmax(0, 1.6fr) minmax(300px, .8fr); gap:1rem; align-items:start; }
    .card { border:1px solid #d9dee8; border-radius:14px; padding:1rem; background:#fff; }
    .card-title { display:flex; justify-content:space-between; align-items:center; gap:.75rem; margin-bottom:.8rem; }
    .card-title h2 { margin:0; font-size:1.05rem; }
    .table-wrap { overflow:auto; }
    table { width:100%; border-collapse:collapse; }
    th, td { text-align:left; padding:.75rem .55rem; border-bottom:1px solid #eceff4; vertical-align:top; }
    td small { display:block; opacity:.68; margin-top:.2rem; }
    .form-card form { display:grid; gap:.55rem; }
    input, select, textarea { width:100%; box-sizing:border-box; border:1px solid #cbd3df; border-radius:9px; padding:.68rem .75rem; font:inherit; }
    textarea { resize:vertical; }
    .checkbox-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.45rem; border:1px solid #e1e5ec; border-radius:9px; padding:.7rem; }
    .check-row { display:flex; align-items:center; gap:.45rem; }
    .check-row input { width:auto; }
    .chips { display:flex; gap:.35rem; flex-wrap:wrap; }
    .chip { padding:.18rem .45rem; border-radius:999px; background:#eef2f8; font-size:.82rem; }
    .btn, .link-btn { cursor:pointer; font:inherit; }
    .btn { border:0; border-radius:9px; padding:.65rem .9rem; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
    .btn-primary { background:#2457d6; color:white; }
    .btn-secondary { background:#eef2f8; color:#25324a; }
    .link-btn { border:0; background:transparent; padding:.2rem; text-decoration:underline; }
    .danger { color:#b42318; }
    .alert { border-radius:10px; padding:.7rem .85rem; }
    .success { background:#eaf8ef; color:#176b3a; }
    .error, .field-error { color:#b42318; }
    .alert.error { background:#fff0ef; }
    .field-error, .hint { font-size:.82rem; }
    .hint, .muted { opacity:.66; }
    .empty { text-align:center; padding:1.2rem; opacity:.65; }
    @media (max-width: 950px) { .content-grid { grid-template-columns:1fr; } }
  `]
})
export class MedicosPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  medicos: MedicoAdmin[] = [];
  usuariosDoctor: UsuarioDoctorApi[] = [];
  especialidades: Especialidad[] = [];
  selectedEspecialidades: number[] = [];

  editingId: number | null = null;
  editingUsuarioId: number | null = null;
  eliminandoId: number | null = null;
  cargando = false;
  guardando = false;
  especialidadesTouched = false;
  mensaje = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    numeroColegiado: ['', [Validators.required, Validators.maxLength(30)]],
    aniosExperiencia: [0, [Validators.required, Validators.min(0)]],
    biografia: ['']
  });

  constructor(
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  get usuariosDoctorDisponibles(): UsuarioDoctorApi[] {
    const usuariosYaUsados = new Set(
      this.medicos
        .filter((medico) => medico.usuarioId !== this.editingUsuarioId)
        .map((medico) => medico.usuarioId)
    );

    return this.usuariosDoctor.filter((usuario) => !usuariosYaUsados.has(usuario.id));
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorMessage = '';

    forkJoin({
      medicos: this.medicoService.listarAdmin(),
      usuariosDoctor: this.medicoService.listarUsuariosDoctor(),
      especialidades: this.especialidadService.listar()
    }).pipe(finalize(() => (this.cargando = false))).subscribe({
      next: ({ medicos, usuariosDoctor, especialidades }) => {
        this.medicos = medicos;
        this.usuariosDoctor = usuariosDoctor;
        this.especialidades = especialidades;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error, 'No fue posible cargar médicos, usuarios o especialidades.');
      }
    });
  }

  nuevoMedico(): void {
    this.editingId = null;
    this.editingUsuarioId = null;
    this.selectedEspecialidades = [];
    this.especialidadesTouched = false;
    this.errorMessage = '';

    this.form.reset({
      usuarioId: 0,
      numeroColegiado: '',
      aniosExperiencia: 0,
      biografia: ''
    });
  }

  editarMedico(medico: MedicoAdmin): void {
    this.editingId = medico.id;
    this.editingUsuarioId = medico.usuarioId;
    this.selectedEspecialidades = medico.especialidades.map((especialidad) => especialidad.id);
    this.especialidadesTouched = false;
    this.errorMessage = '';

    this.form.reset({
      usuarioId: medico.usuarioId,
      numeroColegiado: medico.numeroColegiado,
      aniosExperiencia: medico.aniosExperiencia,
      biografia: medico.biografia ?? ''
    });
  }

  especialidadSeleccionada(id: number): boolean {
    return this.selectedEspecialidades.includes(id);
  }

  alternarEspecialidad(id: number): void {
    this.especialidadesTouched = true;
    this.selectedEspecialidades = this.especialidadSeleccionada(id)
      ? this.selectedEspecialidades.filter((especialidadId) => especialidadId !== id)
      : [...this.selectedEspecialidades, id];
  }

  guardar(): void {
    this.mensaje = '';
    this.errorMessage = '';
    this.especialidadesTouched = true;

    if (this.form.invalid || this.selectedEspecialidades.length === 0) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Revisa los datos obligatorios antes de guardar.';
      return;
    }

    const values = this.form.getRawValue();
    const payload: MedicoRequest = {
      usuario: { id: values.usuarioId },
      numeroColegiado: values.numeroColegiado.trim(),
      aniosExperiencia: values.aniosExperiencia,
      biografia: values.biografia.trim() || null,
      especialidades: this.selectedEspecialidades.map((id) => ({ id }))
    };

    this.guardando = true;
    const request$ = this.editingId
      ? this.medicoService.actualizar(this.editingId, payload)
      : this.medicoService.crear(payload);

    request$.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.mensaje = this.editingId
          ? 'Médico actualizado correctamente.'
          : 'Médico registrado correctamente.';
        this.nuevoMedico();
        this.cargarDatos();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(
          error,
          'Spring Boot rechazó la operación. Revisa el usuario, colegiado y especialidades.'
        );
      }
    });
  }

  eliminarMedico(medico: MedicoAdmin): void {
    const confirmado = confirm(`¿Eliminar el perfil médico de ${medico.nombreCompleto}?`);
    if (!confirmado) {
      return;
    }

    this.mensaje = '';
    this.errorMessage = '';
    this.eliminandoId = medico.id;

    this.medicoService.eliminar(medico.id)
      .pipe(finalize(() => (this.eliminandoId = null)))
      .subscribe({
        next: () => {
          this.mensaje = 'Médico eliminado correctamente.';
          if (this.editingId === medico.id) {
            this.nuevoMedico();
          }
          this.cargarDatos();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'No se pudo eliminar el médico. Puede tener horarios o citas relacionadas.'
          );
        }
      });
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error.error as { message?: string; error?: string } | null;
    return body?.message || body?.error || fallback;
  }
}
