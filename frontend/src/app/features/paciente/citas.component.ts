import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Cita } from '../../core/models/cita.model';
import { Horario } from '../../core/models/horario.model';
import { CitaService } from '../../core/services/cita.service';
import { HorarioService } from '../../core/services/horario.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

const motivoNoVacio: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { whitespace: true };

@Component({
  selector: 'app-paciente-citas',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [`.field { display: grid; gap: 7px; } .appointments-card { margin-top: 22px; }`],
  template: `
    <div class="page-header">
      <div><span class="eyebrow">PACIENTE</span><h1>Mis citas</h1></div>
      @if (!showBooking) {
        <button class="btn btn-primary" type="button" (click)="abrirReserva()">Reservar cita</button>
      }
    </div>

    @if (message) { <div class="alert success" role="status">{{ message }}</div> }
    @if (errorMessage) { <div class="alert error" role="alert">{{ errorMessage }}</div> }

    @if (showBooking) {
      <section class="card form-card booking-card">
        <div class="card-title"><h2>Confirmar cita</h2></div>
        <form [formGroup]="form" (ngSubmit)="reservar()">
          <div class="field">
            <label for="horarioId">Médico, fecha y hora</label>
            <select id="horarioId" formControlName="horarioId">
              <option [ngValue]="0">Selecciona un horario disponible</option>
              @for (horario of horarios; track horario.id) {
                <option [ngValue]="horario.id">{{ horario.nombreMedico }} · {{ horario.fecha }} · {{ horario.horaInicio.slice(0, 5) }}–{{ horario.horaFin.slice(0, 5) }}</option>
              }
            </select>
            @if (form.controls.horarioId.touched && form.controls.horarioId.invalid) {
              <small class="field-error">Selecciona un horario disponible.</small>
            }
            @if (horarios.length === 0 && !loadingSchedules) {
              <small>No hay horarios disponibles en este momento.</small>
            }
          </div>

          @if (horarioSeleccionado; as seleccionado) {
            <div class="patient-summary">
              <strong>{{ seleccionado.nombreMedico }}</strong>
              <p>{{ seleccionado.fecha }} · {{ seleccionado.horaInicio.slice(0, 5) }}–{{ seleccionado.horaFin.slice(0, 5) }}</p>
            </div>
          }

          <div class="field">
            <label for="motivo">Motivo de consulta</label>
            <textarea id="motivo" rows="4" maxlength="255" formControlName="motivo" placeholder="Describe brevemente el motivo"></textarea>
            <small>{{ form.controls.motivo.value.length }}/255 caracteres</small>
            @if (form.controls.motivo.touched && form.controls.motivo.invalid) {
              <small class="field-error">El motivo es obligatorio y debe tener entre 5 y 255 caracteres, sin quedar en blanco.</small>
            }
          </div>

          <div class="form-actions">
            <button class="btn btn-outline" type="button" (click)="cancelarReserva()">Volver a Mis citas</button>
            <button class="btn btn-primary" type="submit" [disabled]="saving || loadingSchedules || horarios.length === 0">
              {{ saving ? 'Reservando…' : 'Confirmar cita' }}
            </button>
          </div>
        </form>
      </section>
    }

    <section class="card table-card appointments-card">
      <div class="card-title"><h2>Historial de citas</h2><span>{{ citas.length }} citas</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fecha y hora</th><th>Médico</th><th>Motivo</th><th>Estado</th></tr></thead>
          <tbody>
            @for (cita of citas; track cita.id) {
              <tr>
                <td><strong>{{ cita.fecha }}</strong><small>{{ cita.horaInicio.slice(0, 5) }}–{{ cita.horaFin.slice(0, 5) }}</small></td>
                <td>{{ cita.medicoNombre }}</td>
                <td>{{ cita.motivo }}</td>
                <td><span class="badge" [class.ok]="cita.estado === 'COMPLETADA'" [class.warning-badge]="cita.estado === 'PENDIENTE'" [class.danger]="cita.estado === 'CANCELADA'">{{ cita.estado }}</span></td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty">Todavía no tienes citas registradas.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class CitasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly citaService = inject(CitaService);
  private readonly horarioService = inject(HorarioService);

  citas: Cita[] = [];
  horarios: Horario[] = [];
  showBooking = false;
  loadingSchedules = false;
  saving = false;
  message = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    horarioId: [0, [Validators.required, Validators.min(1)]],
    motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255), motivoNoVacio]],
  });

  get horarioSeleccionado(): Horario | undefined {
    return this.horarios.find((horario) => horario.id === this.form.controls.horarioId.value);
  }

  ngOnInit(): void {
    this.cargarCitas();
  }

  abrirReserva(): void {
    this.showBooking = true;
    this.message = '';
    this.errorMessage = '';
    this.form.reset({ horarioId: 0, motivo: '' });
    this.cargarHorarios();
  }

  cancelarReserva(): void {
    this.showBooking = false;
    this.errorMessage = '';
  }

  reservar(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { horarioId, motivo } = this.form.getRawValue();
    this.saving = true;
    this.citaService.reservar({ horarioId, motivo: motivo.trim() })
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.message = 'Cita reservada correctamente.';
          this.showBooking = false;
          this.cargarCitas();
          this.cargarHorarios();
        },
        error: (error: unknown) => {
          this.errorMessage = apiErrorMessage(error);
          this.form.controls.horarioId.setValue(0);
          this.cargarHorarios();
        },
      });
  }

  private cargarCitas(): void {
    this.citaService.misCitas().subscribe({
      next: (citas) => this.citas = citas,
      error: (error: unknown) => this.errorMessage = apiErrorMessage(error),
    });
  }

  private cargarHorarios(): void {
    this.loadingSchedules = true;
    this.horarioService.disponibles().pipe(finalize(() => this.loadingSchedules = false)).subscribe({
      next: (horarios) => this.horarios = horarios,
      error: (error: unknown) => this.errorMessage = apiErrorMessage(error),
    });
  }
}
