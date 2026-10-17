import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Horario, HorarioRequest } from '../../core/models/horario.model';
import { DoctorPublico } from '../../core/models/medico.model';
import { AuthService } from '../../core/services/auth.service';
import { HorarioService } from '../../core/services/horario.service';
import { MedicoService } from '../../core/services/medico.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector:'app-horarios-page', standalone:true, imports:[ReactiveFormsModule],
  template:`
    <div class="page-header"><div><span class="eyebrow">AGENDA</span><h1>Horarios de atención</h1><p>Consulta y administra los horarios de atención.</p></div></div>
    @if(message){<div class="alert success">{{message}}</div>} @if(errorMessage){<div class="alert error">{{errorMessage}}</div>}

    <section class="card filter-card">
      <form [formGroup]="filterForm" (ngSubmit)="consultar()" class="filter-row">
        @if(isAdmin){<div><label>Médico</label><select formControlName="medicoId"><option [ngValue]="0">Todos</option>@for(m of medicos;track m.id){<option [ngValue]="m.id">{{m.nombreCompleto}}</option>}</select></div>}
        <div><label>Fecha</label><input type="date" formControlName="fecha"></div>
        <button class="btn btn-outline" type="submit">Consultar agenda</button>
      </form>
    </section>

    <div class="two-column">
      <section class="card table-card"><div class="card-title"><h2>Bloques registrados</h2><span>{{horarios.length}} resultados</span></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Médico</th><th>Horario</th><th>Estado</th><th></th></tr></thead><tbody>
        @for(h of horarios;track h.id){<tr><td>{{formatearFecha(h.fecha)}}</td><td><strong>{{h.nombreMedico}}</strong></td><td>{{h.horaInicio}} - {{h.horaFin}}</td><td><span class="badge" [class.ok]="h.estado==='DISPONIBLE'" [class.warning-badge]="h.estado==='RESERVADO'" [class.danger]="h.estado==='CANCELADO'">{{h.estado}}</span></td><td class="actions">@if(h.estado==='DISPONIBLE'){<button class="link-btn" (click)="editar(h)">Editar</button><button class="link-btn danger-text" (click)="cancelar(h)">Cancelar</button>}</td></tr>}
        @empty{<tr><td colspan="5" class="empty">No hay horarios para el filtro seleccionado.</td></tr>}
      </tbody></table></div></section>

      <section class="card form-card"><div class="card-title"><h2>{{editingId?'Editar horario':'Nuevo horario'}}</h2></div><form [formGroup]="form" (ngSubmit)="guardar()">
        <label>Médico</label><select formControlName="medicoId" [attr.disabled]="!isAdmin ? true : null"><option [ngValue]="0">Seleccione...</option>@for(m of medicos;track m.id){<option [ngValue]="m.id">{{m.nombreCompleto}}</option>}</select>
        <label>Fecha</label><input type="date" [min]="today" formControlName="fecha">
        <div class="form-row"><div><label>Hora inicio</label><input type="time" formControlName="horaInicio"></div><div><label>Hora fin</label><input type="time" formControlName="horaFin"></div></div>
        <div class="form-actions"><button type="button" class="btn btn-outline" (click)="nuevo()">Limpiar</button><button class="btn btn-primary" [disabled]="saving">{{saving?'Guardando...':'Guardar horario'}}</button></div>
      </form></section>
    </div>
  `
})
export class HorariosPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  horarios: Horario[] = [];
  medicos: DoctorPublico[] = [];
  editingId: number | null = null;
  saving = false;
  message = '';
  errorMessage = '';
  readonly today = this.isoDate(new Date());

  get isAdmin(): boolean { return this.auth.role === 'ROLE_ADMIN'; }
  readonly filterForm = this.fb.nonNullable.group({ medicoId: [0], fecha: [''] });
  readonly form = this.fb.nonNullable.group({
    medicoId: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required]
  });

  constructor(private auth: AuthService, private service: HorarioService,
              private medicosService: MedicoService) {}

  ngOnInit(): void {
    if (this.isAdmin) {
      this.medicosService.listarPublicos().subscribe({
        next: medicos => { this.medicos = medicos; this.consultar(); this.cdr.markForCheck(); },
        error: e => {
          this.errorMessage = 'Médicos: ' + apiErrorMessage(e);
          this.consultar(); // aun sin médicos, mostrar agenda general
          this.cdr.markForCheck();
        }
      });
    } else {
      this.medicosService.miPerfil().subscribe({
        next: medico => {
          this.medicos = [medico];
          this.form.patchValue({ medicoId: medico.id });
          this.filterForm.patchValue({ medicoId: medico.id });
          this.consultar();
          this.cdr.markForCheck();
        },
        error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
      });
    }
  }

  consultar(): void {
    const f = this.filterForm.getRawValue();
    const medicoId = this.isAdmin ? (f.medicoId || undefined) : this.medicos[0]?.id;
    if (!this.isAdmin && !medicoId) return;
    this.service.gestionar(medicoId, f.fecha || undefined).subscribe({
      next: horarios => { this.horarios = horarios; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  nuevo(): void {
    this.editingId = null;
    this.form.reset({ medicoId: this.isAdmin ? 0 : (this.medicos[0]?.id ?? 0), fecha: '', horaInicio: '', horaFin: '' });
    this.errorMessage = '';
  }

  editar(h: Horario): void {
    this.editingId = h.id;
    this.form.reset({ medicoId: h.medicoId, fecha: h.fecha,
      horaInicio: h.horaInicio.substring(0, 5), horaFin: h.horaFin.substring(0, 5) });
  }

  guardar(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos.';
      return;
    }
    const v = this.form.getRawValue();
    if (v.horaInicio >= v.horaFin) {
      this.errorMessage = 'La hora final debe ser posterior a la hora inicial.';
      return;
    }
    const payload: HorarioRequest = {
      medicoId: v.medicoId, fecha: v.fecha, horaInicio: v.horaInicio, horaFin: v.horaFin
    };
    this.saving = true;
    const peticion = this.editingId
      ? this.service.actualizar(this.editingId, payload)
      : this.service.crear(payload);
    peticion.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => { this.message = 'Horario guardado.'; this.nuevo(); this.consultar(); this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  cancelar(h: Horario): void {
    if (!confirm(`¿Cancelar el horario ${this.formatearFecha(h.fecha)} ${h.horaInicio}?`)) return;
    this.service.cancelar(h.id).subscribe({
      next: () => { this.message = 'Horario cancelado.'; this.consultar(); this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  // Solo cambia cómo se muestra la fecha; Angular y Spring siguen usando yyyy-MM-dd.
  formatearFecha(fecha: string): string {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : fecha;
  }

  private isoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
