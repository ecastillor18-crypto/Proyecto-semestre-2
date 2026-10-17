import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Cita } from '../../core/models/cita.model';
import { CitaService } from '../../core/services/cita.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector:'app-consultas-page', standalone:true, imports:[ReactiveFormsModule],
  template:`
    <div class="page-header"><div><span class="eyebrow">CONSULTA MÉDICA</span><h1>Mis citas</h1><p>Consulta y administra tus citas médicas.</p></div></div>
    @if(message){<div class="alert success">{{message}}</div>} @if(errorMessage){<div class="alert error">{{errorMessage}}</div>}
    <section class="card filter-card"><form [formGroup]="filterForm" (ngSubmit)="cargar()" class="filter-row"><div><label>Fecha</label><input type="date" formControlName="fecha"></div><button class="btn btn-outline">Ver agenda</button></form></section>
    <div class="two-column">
      <section class="card table-card"><div class="card-title"><h2>Citas del día</h2><span>{{citas.length}} citas</span></div><div class="table-wrap"><table><thead><tr><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th><th></th></tr></thead><tbody>
        @for(c of citas;track c.id){<tr><td><strong>{{c.horaInicio}}</strong></td><td>{{c.pacienteNombre}}</td><td>{{c.motivo}}</td><td><span class="badge" [class.ok]="c.estado==='COMPLETADA'" [class.warning-badge]="c.estado==='PENDIENTE'" [class.danger]="c.estado==='CANCELADA'">{{c.estado}}</span></td><td>@if(c.estado!=='CANCELADA'){<button class="link-btn" (click)="atender(c)">{{c.estado==='COMPLETADA'?'Ver / editar':'Atender'}}</button>}</td></tr>}
        @empty{<tr><td colspan="5" class="empty">No hay citas para esta fecha.</td></tr>}
      </tbody></table></div></section>
      <section class="card form-card">
        @if(selected){<div class="card-title"><div><h2>Ficha médica</h2><span>{{selected.pacienteNombre}} · {{selected.horaInicio}}</span></div></div><div class="patient-summary"><strong>Motivo de consulta</strong><p>{{selected.motivo}}</p></div><form [formGroup]="form" (ngSubmit)="guardarDiagnostico()"><label>Diagnóstico</label><textarea rows="6" formControlName="diagnostico" placeholder="Resultado de la evaluación médica"></textarea><label>Receta / indicaciones</label><textarea rows="6" formControlName="receta" placeholder="Tratamiento, medicamento o indicaciones"></textarea><div class="form-actions"><button class="btn btn-primary" [disabled]="saving">{{saving?'Guardando...':'Finalizar consulta'}}</button></div></form>}
        @else{<div class="empty-panel"><h2>Selecciona una cita</h2><p>Presiona Atender para completar la ficha del paciente.</p></div>}
      </section>
    </div>
  `
})
export class ConsultasPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  citas: Cita[] = [];
  selected: Cita | null = null;
  saving = false;
  message = '';
  errorMessage = '';
  readonly filterForm = this.fb.nonNullable.group({ fecha: [this.today(), Validators.required] });
  readonly form = this.fb.nonNullable.group({ diagnostico: ['', Validators.required], receta: [''] });

  constructor(private service: CitaService) {}
  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.errorMessage = '';
    this.service.citasDoctor(this.filterForm.controls.fecha.value).subscribe({
      next: citas => { this.citas = citas; this.selected = null; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  atender(c: Cita): void {
    this.selected = c;
    this.form.reset({ diagnostico: c.diagnostico ?? '', receta: c.receta ?? '' });
    this.message = '';
    this.errorMessage = '';
  }

  guardarDiagnostico(): void {
    if (!this.selected) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'El diagnóstico es obligatorio.';
      return;
    }
    this.saving = true;
    const v = this.form.getRawValue();
    this.service.registrarDiagnostico(this.selected.id, {
      diagnostico: v.diagnostico.trim(), receta: v.receta.trim() || null
    }).pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => {
        this.message = 'Consulta finalizada y diagnóstico guardado.';
        this.cargar();
        this.cdr.markForCheck();
      },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  private today(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
