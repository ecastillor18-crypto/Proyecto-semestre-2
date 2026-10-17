import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Rol } from '../../core/models/rol.model';
import { RolService } from '../../core/services/rol.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-roles-page', standalone: true, imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><div><span class="eyebrow">SEGURIDAD</span><h1>Roles</h1><p>Administra los roles y los permisos de acceso.</p></div><button class="btn btn-primary" (click)="nuevo()">+ Nuevo rol</button></div>
    <div class="alert warning">Los roles ROLE_ADMIN, ROLE_DOCTOR y ROLE_PATIENT están vinculados a las reglas de seguridad. No conviene renombrarlos.</div>
    @if (message) { <div class="alert success">{{ message }}</div> } @if (errorMessage) { <div class="alert error">{{ errorMessage }}</div> }
    <div class="two-column">
      <section class="card table-card"><div class="card-title"><h2>Roles registrados</h2></div><div class="table-wrap"><table><thead><tr><th>Rol</th><th>Descripción</th><th></th></tr></thead><tbody>
        @for (r of roles; track r.id) { <tr><td><strong>{{ r.nombreRol }}</strong></td><td>{{ r.descripcion || '-' }}</td><td class="actions"><button class="link-btn" (click)="editar(r)">Editar</button><button class="link-btn danger-text" (click)="eliminar(r)">Eliminar</button></td></tr> } @empty { <tr><td colspan="3" class="empty">No hay roles.</td></tr> }
      </tbody></table></div></section>
      <section class="card form-card"><div class="card-title"><h2>{{ editingId ? 'Editar rol' : 'Nuevo rol' }}</h2></div><form [formGroup]="form" (ngSubmit)="guardar()"><label>Nombre del rol</label><input formControlName="nombreRol" placeholder="ROLE_SECRETARY"><label>Descripción</label><textarea formControlName="descripcion" rows="4"></textarea><div class="form-actions"><button type="button" class="btn btn-outline" (click)="nuevo()">Limpiar</button><button class="btn btn-primary" [disabled]="saving">{{saving ? 'Guardando...' : 'Guardar'}}</button></div></form></section>
    </div>
  `
})
export class RolesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  roles: Rol[] = [];
  editingId: number | null = null;
  message = '';
  errorMessage = '';
  saving = false;

  readonly form = this.fb.nonNullable.group({
    nombreRol: ['', [Validators.required, Validators.pattern(/^ROLE_[A-Z_]+$/)]],
    descripcion: ['']
  });

  constructor(private service: RolService) {}
  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.service.listar().subscribe({
      next: roles => { this.roles = roles; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  nuevo(): void {
    this.editingId = null;
    this.form.reset({ nombreRol: '', descripcion: '' });
    this.errorMessage = '';
  }

  editar(r: Rol): void {
    this.editingId = r.id;
    this.form.reset({ nombreRol: r.nombreRol, descripcion: r.descripcion ?? '' });
  }

  guardar(): void {
    if (this.saving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'El nombre debe tener formato ROLE_NOMBRE.';
      return;
    }
    const v = this.form.getRawValue();
    const payload = { nombreRol: v.nombreRol.trim(), descripcion: v.descripcion.trim() || null };
    this.saving = true;
    const peticion = this.editingId
      ? this.service.actualizar(this.editingId, payload)
      : this.service.crear(payload);
    peticion.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => { this.message = 'Rol guardado.'; this.nuevo(); this.cargar(); this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  eliminar(r: Rol): void {
    if (!confirm(`¿Eliminar ${r.nombreRol}?`)) return;
    this.service.eliminar(r.id).subscribe({
      next: () => { this.message = 'Rol eliminado.'; this.cargar(); this.cdr.markForCheck(); },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }
}
