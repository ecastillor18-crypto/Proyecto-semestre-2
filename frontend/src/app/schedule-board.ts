import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  Doctor,
  LoginResponse,
  SchedulePayload,
  ScheduleService,
  ScheduleSlot,
  ScheduleState
} from './schedule.service';

const orderedTimeRange: ValidatorFn = (control): ValidationErrors | null => {
  const start = control.get('horaInicio')?.value as string | undefined;
  const end = control.get('horaFin')?.value as string | undefined;
  return start && end && end <= start ? { invalidTimeRange: true } : null;
};

@Component({
  selector: 'app-schedule-board',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-board.html',
  styleUrl: './schedule-board.scss'
})
export class ScheduleBoard implements OnInit {
  private readonly schedulesApi = inject(ScheduleService);
  private readonly storageKey = 'agenda-admin-session';

  readonly doctors = signal<Doctor[]>([]);
  readonly agenda = signal<ScheduleSlot[]>([]);
  readonly session = signal<LoginResponse | null>(this.restoreSession());
  readonly editingId = signal<number | null>(null);
  readonly loadingDoctors = signal(false);
  readonly loadingAgenda = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly totalSlots = computed(() => this.agenda().length);
  readonly availableSlots = computed(() => this.countState('DISPONIBLE'));
  readonly reservedSlots = computed(() => this.countState('RESERVADO'));
  readonly canceledSlots = computed(() => this.countState('CANCELADO'));

  readonly loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  readonly scheduleForm = new FormGroup(
    {
      medicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      fecha: new FormControl(this.localToday(), { nonNullable: true, validators: [Validators.required] }),
      horaInicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      horaFin: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    },
    { validators: orderedTimeRange }
  );

  ngOnInit(): void {
    if (this.session()) {
      this.loadDoctors();
    }
  }

  login(): void {
    this.errorMessage.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.schedulesApi.login(email.trim(), password).subscribe({
      next: (response) => {
        if (response.role !== 'ROLE_ADMIN') {
          this.errorMessage.set('Esta pantalla requiere una cuenta con rol administrador.');
          return;
        }
        this.session.set(response);
        localStorage.setItem(this.storageKey, JSON.stringify(response));
        this.loginForm.controls.password.reset();
        this.loadDoctors();
      },
      error: (error: unknown) => this.errorMessage.set(this.describeError(error, 'No se pudo iniciar sesión.'))
    });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
    this.agenda.set([]);
    this.doctors.set([]);
    this.resetEditor();
  }

  loadAgenda(): void {
    const { medicoId, fecha } = this.scheduleForm.getRawValue();
    const session = this.session();
    if (!session || !medicoId || !fecha) {
      this.agenda.set([]);
      return;
    }

    this.loadingAgenda.set(true);
    this.schedulesApi.listSchedules(session.token).subscribe({
      next: (slots) => {
        this.agenda.set(
          slots
            .filter((slot) => slot.medico?.id === Number(medicoId) && slot.fecha === fecha)
            .sort((first, second) => first.horaInicio.localeCompare(second.horaInicio))
        );
        this.loadingAgenda.set(false);
      },
      error: (error: unknown) => {
        this.loadingAgenda.set(false);
        this.errorMessage.set(this.describeError(error, 'No se pudo consultar la agenda.'));
      }
    });
  }

  saveSchedule(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const session = this.session();
    if (!session) {
      return;
    }

    const { medicoId, fecha, horaInicio, horaFin } = this.scheduleForm.getRawValue();
    const payload: SchedulePayload = {
      medico: { id: Number(medicoId) },
      fecha,
      horaInicio,
      horaFin,
      estado: 'DISPONIBLE'
    };
    const id = this.editingId();
    this.saving.set(true);
    const request = id
      ? this.schedulesApi.updateSchedule(session.token, id, payload)
      : this.schedulesApi.createSchedule(session.token, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(id ? 'Horario actualizado.' : 'Horario agregado a la agenda.');
        this.resetEditor();
        this.loadAgenda();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(this.describeError(error, 'No se pudo guardar el horario.'));
      }
    });
  }

  editSchedule(slot: ScheduleSlot): void {
    if (slot.estado !== 'DISPONIBLE') {
      return;
    }
    this.editingId.set(slot.id);
    this.scheduleForm.patchValue({
      medicoId: String(slot.medico.id),
      fecha: slot.fecha,
      horaInicio: this.inputTime(slot.horaInicio),
      horaFin: this.inputTime(slot.horaFin)
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelSchedule(slot: ScheduleSlot): void {
    const session = this.session();
    if (!session || slot.estado !== 'DISPONIBLE') {
      return;
    }

    const payload: SchedulePayload = {
      medico: { id: slot.medico.id },
      fecha: slot.fecha,
      horaInicio: this.inputTime(slot.horaInicio),
      horaFin: this.inputTime(slot.horaFin),
      estado: 'CANCELADO'
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.schedulesApi.updateSchedule(session.token, slot.id, payload).subscribe({
      next: () => {
        this.successMessage.set('Horario cancelado.');
        if (this.editingId() === slot.id) {
          this.resetEditor();
        }
        this.loadAgenda();
      },
      error: (error: unknown) => this.errorMessage.set(this.describeError(error, 'No se pudo cancelar el horario.'))
    });
  }

  resetEditor(): void {
    this.editingId.set(null);
    this.scheduleForm.reset({
      medicoId: this.scheduleForm.controls.medicoId.value,
      fecha: this.scheduleForm.controls.fecha.value,
      horaInicio: '',
      horaFin: ''
    });
  }

  stateLabel(state: ScheduleState): string {
    return state.charAt(0) + state.slice(1).toLowerCase();
  }

  displayTime(time: string): string {
    return this.inputTime(time);
  }

  private loadDoctors(): void {
    this.loadingDoctors.set(true);
    this.schedulesApi.listDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.loadingDoctors.set(false);
      },
      error: (error: unknown) => {
        this.loadingDoctors.set(false);
        this.errorMessage.set(this.describeError(error, 'No se pudo cargar la lista de médicos.'));
      }
    });
  }

  private countState(state: ScheduleState): number {
    return this.agenda().filter((slot) => slot.estado === state).length;
  }

  private inputTime(time: string): string {
    return time.slice(0, 5);
  }

  private localToday(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60_000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
  }

  private restoreSession(): LoginResponse | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? (JSON.parse(saved) as LoginResponse) : null;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private describeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { detail?: string; message?: string } | null;
      return body?.detail || body?.message || fallback;
    }
    return fallback;
  }
}