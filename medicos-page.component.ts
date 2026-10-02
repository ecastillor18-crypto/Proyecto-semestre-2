import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { Especialidad } from '../../core/models/especialidad.model';
import { MedicoAdmin, MedicoRequest } from '../../core/models/medico.model';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { MedicoService } from '../../core/services/medico.service';

@Component({
  selector: 'app-medicos-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section>
      <header class="page-header">
        <div>
          <h1>Médicos</h1>
          <p>Avance 60%: listado, registro y edición de perfiles médicos.</p>
        </div>
        <button type="button" class="btn btn-primary" (click)="nuevoMedico()">
          + Registrar médico
        </button>
      </header>

      @if (mensaje) {
        <p class="success-message">{{ mensaje }}</p>
      }

      @if (errorMessage) {
        <p class="error-message">{{ errorMessage }}</p>
      }

      <div class="two-column wide-form">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Médico</th>
                <th>Colegiado</th>
                <th>Experiencia</th>
                <th>Especialidades</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (medico of medicos; track medico.id) {
                <tr>
                  <td>
                    <strong>{{ medico.nombreCompleto }}</strong><br>
                    <small>{{ medico.email }}</small>
                  </td>
                  <td>{{ medico.numeroColegiado }}</td>
                  <td>{{ medico.aniosExperiencia }} años</td>
                  <td>
                    @for (especialidad of medico.especialidades; track especialidad.id) {
                      <span>{{ especialidad.nombre }}</span>
                      @if (!$last) {, }
                    }
                  </td>
                  <td>
                    <button type="button" class="link-btn" (click)="editarMedico(medico)">
                      Editar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">No hay médicos registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <section class="form-card">
          <h2>{{ editingId ? 'Editar médico' : 'Registrar médico' }}</h2>

          <form [formGroup]="form" (ngSubmit)="guardar()">
            <label for="usuarioId">ID del usuario con ROLE_DOCTOR</label>
            <input
              id="usuarioId"
              type="number"
              min="1"
              formControlName="usuarioId"
              placeholder="Ejemplo: 3">
            @if (form.controls.usuarioId.touched && form.controls.usuarioId.invalid) {
              <small class="error-message">Ingresa un ID de usuario válido.</small>
            }

            <label for="numeroColegiado">Número de colegiado</label>
            <input
              id="numeroColegiado"
              type="text"
              formControlName="numeroColegiado"
              placeholder="Ejemplo: COL-12345">
            @if (form.controls.numeroColegiado.touched && form.controls.numeroColegiado.invalid) {
              <small class="error-message">El número de colegiado es obligatorio.</small>
            }

            <label for="aniosExperiencia">Años de experiencia</label>
            <input
              id="aniosExperiencia"
              type="number"
              min="0"
              formControlName="aniosExperiencia">
            @if (form.controls.aniosExperiencia.touched && form.controls.aniosExperiencia.invalid) {
              <small class="error-message">La experiencia no puede ser negativa.</small>
            }

            <label>Especialidades</label>
            <div class="checkbox-grid">
              @for (especialidad of especialidades; track especialidad.id) {
                <label>
                  <input
                    type="checkbox"
                    [checked]="especialidadSeleccionada(especialidad.id)"
                    (change)="alternarEspecialidad(especialidad.id)">
                  {{ especialidad.nombre }}
                </label>
              } @empty {
                <small>No hay especialidades registradas.</small>
              }
            </div>

            <label for="biografia">Biografía</label>
            <textarea
              id="biografia"
              rows="4"
              formControlName="biografia"
              placeholder="Información profesional del médico"></textarea>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="nuevoMedico()">
                Limpiar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar médico' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  `
})
export class MedicosPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  medicos: MedicoAdmin[] = [];
  especialidades: Especialidad[] = [];
  selectedEspecialidades: number[] = [];
  editingId: number | null = null;
  guardando = false;
  mensaje = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    numeroColegiado: ['', Validators.required],
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

  cargarDatos(): void {
    this.errorMessage = '';

    forkJoin({
      medicos: this.medicoService.listarAdmin(),
      especialidades: this.especialidadService.listar()
    }).subscribe({
      next: ({ medicos, especialidades }) => {
        this.medicos = medicos;
        this.especialidades = especialidades;
      },
      error: () => {
        this.errorMessage = 'No fue posible cargar médicos o especialidades.';
      }
    });
  }

  nuevoMedico(): void {
    this.editingId = null;
    this.selectedEspecialidades = [];
    this.mensaje = '';
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
    this.selectedEspecialidades = medico.especialidades.map((e) => e.id);
    this.mensaje = '';
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
    if (this.especialidadSeleccionada(id)) {
      this.selectedEspecialidades = this.selectedEspecialidades.filter((x) => x !== id);
    } else {
      this.selectedEspecialidades = [...this.selectedEspecialidades, id];
    }
  }

  guardar(): void {
    this.mensaje = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Revisa los campos obligatorios del formulario.';
      return;
    }

    if (this.selectedEspecialidades.length === 0) {
      this.errorMessage = 'Selecciona al menos una especialidad.';
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
        this.editingId = null;
        this.selectedEspecialidades = [];
        this.form.reset({
          usuarioId: 0,
          numeroColegiado: '',
          aniosExperiencia: 0,
          biografia: ''
        });
        this.cargarDatos();
      },
      error: () => {
        this.errorMessage = 'Spring Boot rechazó la operación. Verifica el usuario, colegiado y especialidades.';
      }
    });
  }
}
