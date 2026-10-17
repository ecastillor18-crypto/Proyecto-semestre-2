import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Especialidad } from '../../core/models/especialidad.model';
import { MedicoAdmin, MedicoRequest } from '../../core/models/medico.model';
import { Usuario } from '../../core/models/usuario.model';
import { EspecialidadService } from '../../core/services/especialidad.service';
import { MedicoService } from '../../core/services/medico.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-medicos-page', standalone: true, imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><div><span class="eyebrow">PERSONAL MÉDICO</span><h1>Médicos</h1><p>El usuario debe existir primero con ROLE_DOCTOR. Después se crea su perfil profesional.</p></div><button class="btn btn-primary" (click)="nuevo()">+ Registrar médico</button></div>
    @if(message){<div class="alert success">{{message}}</div>} @if(errorMessage){<div class="alert error">{{errorMessage}}</div>}
    <div class="two-column wide-form">
      <section class="card table-card"><div class="card-title"><h2>Perfiles médicos</h2><span>{{medicos.length}} registros</span></div><div class="table-wrap"><table><thead><tr><th>Médico</th><th>Colegiado</th><th>Especialidades</th><th></th></tr></thead><tbody>
        @for(m of medicos;track m.id){<tr><td><strong>{{m.nombreCompleto}}</strong><small>{{m.email}} · {{m.aniosExperiencia}} años exp.</small></td><td>{{m.numeroColegiado}}</td><td><div class="chips">@for(e of m.especialidades;track e.id){<span class="badge neutral">{{e.nombre}}</span>}</div></td><td class="actions"><button class="link-btn" (click)="editar(m)">Editar</button><button class="link-btn danger-text" (click)="eliminar(m)">Eliminar</button></td></tr>}
        @empty{<tr><td colspan="4" class="empty">No hay médicos.</td></tr>}
      </tbody></table></div></section>
      <section class="card form-card"><div class="card-title"><h2>{{editingId?'Editar':'Registrar'}} médico</h2></div><form [formGroup]="form" (ngSubmit)="guardar()">
        <label>Usuario con rol DOCTOR</label><select formControlName="usuarioId"><option [ngValue]="0">Seleccione...</option>@for(u of usuariosDoctorDisponibles;track u.id){<option [ngValue]="u.id">{{u.nombre}} {{u.apellido}} — {{u.email}}</option>}</select>
        @if (!usuariosDoctorDisponibles.length) { <small>No hay usuarios DOCTOR disponibles. Crea otro usuario con rol Doctor en Usuarios o edita el perfil existente.</small> }
        <label>Número de colegiado</label><input formControlName="numeroColegiado">
        <label>Años de experiencia</label><input type="number" min="0" formControlName="aniosExperiencia">
        <label>Especialidades</label><div class="checkbox-grid">@for(e of especialidades;track e.id){<label class="check-row"><input type="checkbox" [checked]="isEspecialidadSeleccionada(e.id)" (change)="toggleEspecialidad(e.id)">{{e.nombre}}</label>}</div>
        <label>Biografía</label><textarea rows="5" formControlName="biografia"></textarea>
        <div class="form-actions"><button type="button" class="btn btn-outline" (click)="nuevo()">Limpiar</button><button class="btn btn-primary" [disabled]="saving">{{saving?'Guardando...':'Guardar'}}</button></div>
      </form></section>
    </div>
  `
})
export class MedicosPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  medicos: MedicoAdmin[] = [];
  usuarios: Usuario[] = [];
  especialidades: Especialidad[] = [];
  editingId: number | null = null;
  editingUsuarioId: number | null = null;
  selectedEspecialidades: number[] = [];
  saving = false;
  message = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1)]],
    numeroColegiado: ['', Validators.required],
    aniosExperiencia: [0, [Validators.required, Validators.min(0)]],
    biografia: ['']
  });

  constructor(
    private service: MedicoService,
    private usuariosService: UsuarioService,
    private espService: EspecialidadService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.errorMessage = '';
    // Cada catálogo carga por separado. Un error en usuarios o especialidades
    // ya no impide que se muestre la tabla de médicos.
    this.service.listarAdmin().subscribe({
      next: medicos => { this.medicos = medicos; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = 'Médicos: ' + apiErrorMessage(e); this.cdr.markForCheck(); }
    });
    this.usuariosService.listar().subscribe({
      next: usuarios => { this.usuarios = usuarios; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = 'Usuarios: ' + apiErrorMessage(e); this.cdr.markForCheck(); }
    });
    this.espService.listar().subscribe({
      next: especialidades => { this.especialidades = especialidades; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = 'Especialidades: ' + apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  get usuariosDoctorDisponibles(): Usuario[] {
    const usados = new Set(
      this.medicos.filter(m => m.usuarioId !== this.editingUsuarioId).map(m => m.usuarioId)
    );
    return this.usuarios.filter(u => u.rol === 'ROLE_DOCTOR' && u.activo && !usados.has(u.id));
  }

  nuevo(): void {
    this.editingId = null;
    this.editingUsuarioId = null;
    this.selectedEspecialidades = [];
    this.form.reset({ usuarioId: 0, numeroColegiado: '', aniosExperiencia: 0, biografia: '' });
    this.errorMessage = '';
  }

  editar(m: MedicoAdmin): void {
    this.editingId = m.id;
    this.editingUsuarioId = m.usuarioId;
    this.selectedEspecialidades = m.especialidades.map(e => e.id);
    this.form.reset({
      usuarioId: m.usuarioId,
      numeroColegiado: m.numeroColegiado,
      aniosExperiencia: m.aniosExperiencia,
      biografia: m.biografia ?? ''
    });
  }

  isEspecialidadSeleccionada(id: number): boolean {
    return this.selectedEspecialidades.includes(id);
  }

  toggleEspecialidad(id: number): void {
    this.selectedEspecialidades = this.isEspecialidadSeleccionada(id)
      ? this.selectedEspecialidades.filter(x => x !== id)
      : [...this.selectedEspecialidades, id];
  }

  guardar(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid || this.selectedEspecialidades.length === 0) {
      this.form.markAllAsTouched();
      this.errorMessage = this.selectedEspecialidades.length === 0
        ? 'Selecciona al menos una especialidad.' : 'Revisa los datos del médico.';
      return;
    }
    const v = this.form.getRawValue();
    const payload: MedicoRequest = {
      usuarioId: v.usuarioId,
      numeroColegiado: v.numeroColegiado.trim(),
      aniosExperiencia: v.aniosExperiencia,
      biografia: v.biografia.trim() || null,
      especialidadIds: this.selectedEspecialidades
    };
    this.saving = true;
    const peticion = this.editingId
      ? this.service.actualizar(this.editingId, payload)
      : this.service.crear(payload);
    peticion.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => {
        this.message = 'Perfil médico guardado.';
        this.nuevo();
        this.cargar();
        this.cdr.markForCheck();
      },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  eliminar(m: MedicoAdmin): void {
    if (!confirm(`¿Eliminar el perfil de ${m.nombreCompleto}?`)) return;
    this.service.eliminar(m.id).subscribe({
      next: () => {
        this.message = 'Perfil médico eliminado.';
        this.cargar();
        this.cdr.markForCheck();
      },
      error: e => { this.errorMessage = e.status === 409 ? 'No se puede eliminar este médico porque tiene registros relacionados. Se recomienda conservar el historial.' : apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }
}
