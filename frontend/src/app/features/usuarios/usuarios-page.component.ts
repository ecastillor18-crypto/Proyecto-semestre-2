import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Rol } from '../../core/models/rol.model';
import { Usuario, UsuarioRequest } from '../../core/models/usuario.model';
import { RolService } from '../../core/services/rol.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { apiErrorMessage } from '../../core/utils/api-error.util';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div><span class="eyebrow">ADMINISTRACIÓN</span><h1>Usuarios y acceso</h1><p>Administra las cuentas, los roles y el acceso al sistema.</p></div>
      <button class="btn btn-primary" type="button" (click)="nuevo()">+ Nuevo usuario</button>
    </div>

    @if (message) { <div class="alert success">{{ message }}</div> }
    @if (errorMessage) { <div class="alert error">{{ errorMessage }}</div> }

    <div class="two-column">
      <section class="card table-card">
        <div class="card-title"><h2>Usuarios registrados</h2><span>{{ usuarios.length }} registros</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (u of usuarios; track u.id) {
                <tr>
                  <td><strong>{{ u.nombre }} {{ u.apellido }}</strong><small>{{ u.telefono || 'Sin teléfono' }}</small></td>
                  <td>{{ u.email }}</td>
                  <td><span class="badge neutral">{{ roleLabel(u.rol) }}</span></td>
                  <td><span class="badge" [class.ok]="u.activo" [class.danger]="!u.activo">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
                  <td class="actions"><button class="link-btn" (click)="editar(u)">Editar</button><button class="link-btn danger-text" (click)="eliminar(u)">Eliminar</button></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="empty">No hay usuarios.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="card form-card">
        <div class="card-title"><h2>{{ editingId ? 'Editar usuario' : 'Nuevo usuario' }}</h2></div>
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="form-row"><div><label>Nombre</label><input formControlName="nombre"></div><div><label>Apellido</label><input formControlName="apellido"></div></div>
          <label>Email</label><input type="email" formControlName="email">
          <label>Contraseña</label><input type="password" formControlName="password" [placeholder]="editingId ? 'Dejar vacía para conservarla' : 'Mínimo 8 caracteres'">
          <label>Teléfono</label><input formControlName="telefono">
          <label>Rol</label>
          <select formControlName="rolId"><option [ngValue]="0">Seleccione...</option>@for (r of roles; track r.id) { <option [ngValue]="r.id">{{ roleLabel(r.nombreRol) }}</option> }</select>
          <label class="check-row"><input type="checkbox" formControlName="activo"> Usuario activo</label>
          <div class="form-actions"><button class="btn btn-outline" type="button" (click)="nuevo()">Limpiar</button><button class="btn btn-primary" [disabled]="saving" type="submit">{{ saving ? 'Guardando...' : 'Guardar' }}</button></div>
        </form>
      </section>
    </div>
  `
})
export class UsuariosPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  editingId: number | null = null;
  saving = false;
  message = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.minLength(8)],
    telefono: [''],
    rolId: [0, [Validators.required, Validators.min(1)]],
    activo: [true]
  });

  constructor(private usuariosService: UsuarioService, private rolesService: RolService) {}
  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.errorMessage = '';
    // Carga independiente: un error en roles no debe ocultar la tabla de usuarios.
    this.usuariosService.listar().subscribe({
      next: usuarios => { this.usuarios = usuarios; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = 'Usuarios: ' + apiErrorMessage(e); this.cdr.markForCheck(); }
    });
    this.rolesService.listar().subscribe({
      next: roles => { this.roles = roles; this.cdr.markForCheck(); },
      error: e => { this.errorMessage = 'Roles: ' + apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  nuevo(): void {
    this.editingId = null;
    this.form.reset({ nombre: '', apellido: '', email: '', password: '', telefono: '', rolId: 0, activo: true });
    this.errorMessage = '';
  }

  editar(u: Usuario): void {
    this.editingId = u.id;
    this.form.reset({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', telefono: u.telefono ?? '', rolId: u.rolId, activo: u.activo });
    this.message = '';
    this.errorMessage = '';
  }

  guardar(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid || (!this.editingId && this.form.controls.password.value.length < 8)) {
      this.form.markAllAsTouched();
      this.errorMessage = !this.editingId && this.form.controls.password.value.length < 8
        ? 'La contraseña debe tener al menos 8 caracteres.' : 'Revisa los campos obligatorios.';
      return;
    }
    const value = this.form.getRawValue();
    const payload: UsuarioRequest = {
      nombre: value.nombre.trim(),
      apellido: value.apellido.trim(),
      email: value.email.trim(),
      telefono: value.telefono.trim() || null,
      rolId: value.rolId,
      activo: value.activo
    };
    if (value.password.trim()) payload.password = value.password;
    this.saving = true;
    const peticion = this.editingId
      ? this.usuariosService.actualizar(this.editingId, payload)
      : this.usuariosService.crear(payload);
    peticion.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({
      next: () => {
        this.message = this.editingId ? 'Usuario actualizado.' : 'Usuario creado.';
        this.nuevo();
        this.cargar();
        this.cdr.markForCheck();
      },
      error: e => { this.errorMessage = apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido}?`)) return;
    this.usuariosService.eliminar(u.id).subscribe({
      next: () => { this.message = 'Usuario eliminado.'; this.cargar(); this.cdr.markForCheck(); },
      error: e => { this.errorMessage = e.status === 409 ? 'No se puede eliminar este usuario porque tiene registros relacionados. Se recomienda conservar el historial.' : apiErrorMessage(e); this.cdr.markForCheck(); }
    });
  }

  roleLabel(role: string): string {
    return role.replace('ROLE_', '').replace('ADMIN', 'Administrador')
      .replace('DOCTOR', 'Doctor').replace('PATIENT', 'Paciente');
  }
}
