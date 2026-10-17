import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Especialidad } from '../../core/models/especialidad.model';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({ selector:'app-especialidades-page', standalone:true, imports:[ReactiveFormsModule], template:`
  <div class="page-header"><div><span class="eyebrow">CATÁLOGO</span><h1>Especialidades</h1><p>Especialidades disponibles para los perfiles médicos.</p></div><button class="btn btn-primary" (click)="nuevo()">+ Nueva especialidad</button></div>
  @if(message){<div class="alert success">{{message}}</div>} @if(errorMessage){<div class="alert error">{{errorMessage}}</div>}
  <div class="two-column"><section class="card table-card"><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Descripción</th><th></th></tr></thead><tbody>@for(e of especialidades;track e.id){<tr><td><strong>{{e.nombre}}</strong></td><td>{{e.descripcion||'-'}}</td><td class="actions"><button class="link-btn" (click)="editar(e)">Editar</button><button class="link-btn danger-text" (click)="eliminar(e)">Eliminar</button></td></tr>}@empty{<tr><td colspan="3" class="empty">No hay especialidades.</td></tr>}</tbody></table></div></section>
  <section class="card form-card"><div class="card-title"><h2>{{editingId?'Editar':'Nueva'}} especialidad</h2></div><form [formGroup]="form" (ngSubmit)="guardar()"><label>Nombre</label><input formControlName="nombre"><label>Descripción</label><textarea rows="4" formControlName="descripcion"></textarea><div class="form-actions"><button type="button" class="btn btn-outline" (click)="nuevo()">Limpiar</button><button class="btn btn-primary" [disabled]="saving">{{saving ? 'Guardando...' : 'Guardar'}}</button></div></form></section></div>` })
export class EspecialidadesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  especialidades: Especialidad[] = [];
  editingId: number | null = null;
  message = '';
  errorMessage = '';
  saving = false;
  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  constructor(private service: EspecialidadService) {}
  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.service.listar().subscribe({
      next: items => { this.especialidades = items; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  nuevo(): void {
    this.editingId = null;
    this.form.reset({ nombre: '', descripcion: '' });
    this.errorMessage = '';
  }

  editar(e: Especialidad): void {
    this.editingId = e.id;
    this.form.reset({ nombre: e.nombre, descripcion: e.descripcion ?? '' });
  }

  guardar(): void {
    if (this.saving) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const payload = { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null };
    this.saving = true;
    const peticion = this.editingId
      ? this.service.actualizar(this.editingId, payload)
      : this.service.crear(payload);
    peticion.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => {
        this.message = 'Especialidad guardada.';
        this.nuevo();
        this.cargar();
        this.cdr.markForCheck();
      },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  eliminar(e: Especialidad): void {
    if (!confirm(`¿Eliminar ${e.nombre}?`)) return;
    this.service.eliminar(e.id).subscribe({
      next: () => {
        this.message = 'Especialidad eliminada.';
        this.cargar();
        this.cdr.markForCheck();
      },
      error: err => { this.errorMessage = apiErrorMessage(err); this.cdr.markForCheck(); }
    });
  }
}
