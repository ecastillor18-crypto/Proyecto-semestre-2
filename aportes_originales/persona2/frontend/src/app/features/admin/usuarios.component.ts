import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Rol, Usuario, UsuarioPayload } from '../../core/models/usuario.models';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="encabezado">
      <h2>Usuarios</h2>
      @if (!mostrarForm()) {
        <button class="primario" type="button" (click)="nuevo()">+ Nuevo usuario</button>
      }
    </div>

    @if (mensaje()) {
      <p class="ok">{{ mensaje() }}</p>
    }
    @if (error()) {
      <p class="error caja">{{ error() }}</p>
    }

    @if (mostrarForm()) {
      <form class="tarjeta" [formGroup]="form" (ngSubmit)="guardar()">
        <h3>{{ editandoId() ? 'Editar usuario' : 'Nuevo usuario' }}</h3>

        <div class="fila">
          <div class="campo">
            <label for="nombre">Nombre</label>
            <input id="nombre" formControlName="nombre" />
            @if (invalido('nombre')) {
              <small class="error">El nombre es obligatorio (máx. 80 caracteres)</small>
            }
          </div>
          <div class="campo">
            <label for="apellido">Apellido</label>
            <input id="apellido" formControlName="apellido" />
            @if (invalido('apellido')) {
              <small class="error">El apellido es obligatorio (máx. 80 caracteres)</small>
            }
          </div>
        </div>

        <div class="fila">
          <div class="campo">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="off" />
            @if (invalido('email')) {
              <small class="error">Ingresa un email válido</small>
            }
          </div>
          <div class="campo">
            <label for="telefono">Teléfono (opcional)</label>
            <input id="telefono" formControlName="telefono" />
            @if (invalido('telefono')) {
              <small class="error">Máximo 20 caracteres</small>
            }
          </div>
        </div>

        <div class="fila">
          <div class="campo">
            <label for="password">
              Contraseña @if (editandoId()) { <span class="nota">(déjala vacía para no cambiarla)</span> }
            </label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" />
            @if (invalido('password')) {
              <small class="error">
                {{ editandoId() ? 'Mínimo 8 caracteres' : 'La contraseña es obligatoria (mínimo 8 caracteres)' }}
              </small>
            }
          </div>
          <div class="campo">
            <label for="rolId">Rol</label>
            <select id="rolId" formControlName="rolId">
              <option [ngValue]="null" disabled>Selecciona un rol</option>
              @for (r of roles(); track r.id) {
                <option [ngValue]="r.id">{{ etiquetaRol(r.nombreRol) }}</option>
              }
            </select>
            @if (invalido('rolId')) {
              <small class="error">Selecciona un rol</small>
            }
          </div>
        </div>

        <label class="check">
          <input type="checkbox" formControlName="activo" /> Usuario activo (puede iniciar sesión)
        </label>

        <div class="acciones">
          <button class="primario" type="submit" [disabled]="guardando()">
            {{ guardando() ? 'Guardando...' : 'Guardar' }}
          </button>
          <button type="button" (click)="cancelar()" [disabled]="guardando()">Cancelar</button>
        </div>
      </form>
    }

    @if (cargando()) {
      <p>Cargando usuarios...</p>
    } @else if (usuarios().length === 0) {
      <p class="vacio">Todavía no hay usuarios. Crea el primero con "Nuevo usuario".</p>
    } @else {
      <div class="tabla-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr>
                <td>{{ u.nombre }} {{ u.apellido }}</td>
                <td>{{ u.email }}</td>
                <td>{{ etiquetaRol(u.rol?.nombreRol) }}</td>
                <td>
                  <span class="estado" [class.inactivo]="!u.activo">{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
                </td>
                <td class="col-acciones">
                  <button type="button" (click)="editar(u)">Editar</button>
                  <button
                    type="button"
                    class="peligro"
                    (click)="eliminar(u)"
                    [disabled]="esUsuarioActual(u)"
                    [title]="esUsuarioActual(u) ? 'No puedes eliminar tu propia cuenta' : ''"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .encabezado { display: flex; justify-content: space-between; align-items: center; }
    h2 { margin: 0 0 1rem; color: #1d3557; }
    h3 { margin: 0 0 .6rem; color: #1d3557; }
    .tarjeta { background: #fff; padding: 1.2rem; border-radius: 12px; margin-bottom: 1.2rem;
               box-shadow: 0 4px 20px rgba(0,0,0,.08); display: flex; flex-direction: column; gap: .6rem; }
    .fila { display: flex; gap: 1rem; flex-wrap: wrap; }
    .campo { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: .25rem; }
    label { font-size: .85rem; font-weight: 600; }
    .nota { font-weight: 400; color: #667; }
    input, select { padding: .55rem; border: 1px solid #ccd; border-radius: 6px; font-size: 1rem; }
    input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid #1d3557; outline-offset: 2px; }
    .check { display: flex; align-items: center; gap: .5rem; font-weight: 400; }
    .check input { width: 1rem; height: 1rem; }
    .acciones { display: flex; gap: .6rem; margin-top: .4rem; }
    button { padding: .5rem .9rem; border: 1px solid #1d3557; border-radius: 6px; background: #fff;
             color: #1d3557; cursor: pointer; font-size: .9rem; }
    button.primario { background: #1d3557; color: #fff; }
    button.peligro { border-color: #c1121f; color: #c1121f; }
    button:disabled { opacity: .5; cursor: default; }
    .error { color: #c1121f; font-size: .8rem; }
    .caja { background: #fde8ea; padding: .6rem; border-radius: 6px; font-size: .9rem; }
    .ok { background: #e3f4e8; color: #1b5e20; padding: .6rem; border-radius: 6px; }
    .vacio { color: #667; }
    .tabla-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: .7rem 1rem; border-bottom: 1px solid #e6eaf0; }
    th { font-size: .85rem; color: #556; }
    .col-acciones { display: flex; gap: .4rem; justify-content: flex-end; }
    .estado { padding: .15rem .55rem; border-radius: 999px; background: #e3f4e8; color: #1b5e20; font-size: .8rem; }
    .estado.inactivo { background: #eceff3; color: #556; }
  `],
})
export class UsuariosComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  roles = signal<Rol[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarForm = signal(false);
  editandoId = signal<number | null>(null);
  error = signal('');
  mensaje = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(80)]],
    apellido: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    telefono: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rolId: this.fb.control<number | null>(null, Validators.required),
    activo: [true],
  });

  constructor() {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  // ---------- carga de datos ----------
  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(this.textoError(e, 'No se pudo cargar la lista de usuarios.'));
      },
    });
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: (lista) => this.roles.set(lista),
      error: (e) => this.error.set(this.textoError(e, 'No se pudieron cargar los roles.')),
    });
  }

  // ---------- acciones ----------
  nuevo(): void {
    this.limpiarAvisos();
    this.editandoId.set(null);
    this.form.reset({ nombre: '', apellido: '', email: '', telefono: '', password: '', rolId: null, activo: true });
    //contraseña es obligatoria
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.mostrarForm.set(true);
  }

  editar(u: Usuario): void {
    this.limpiarAvisos();
    this.editandoId.set(u.id);
    this.form.reset({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono ?? '',
      password: '',
      rolId: u.rol?.id ?? null,
      activo: u.activo,
    });
    // al editar la contraseña es opcional (vacía = no cambiar)
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.mostrarForm.set(true);
  }

  cancelar(): void {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
    this.error.set('');
  }

  guardar(): void {
    this.limpiarAvisos();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos: UsuarioPayload = {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      email: v.email.trim(),
      telefono: v.telefono?.trim() || null,
      rol: { id: v.rolId as number },
      activo: v.activo,
    };
    if (v.password) datos.passwordHash = v.password;

    const id = this.editandoId();
    const peticion = id ? this.usuarioService.actualizar(id, datos) : this.usuarioService.crear(datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set(id ? 'Usuario actualizado.' : 'Usuario creado.');
        this.cancelar();
        this.cargarUsuarios();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(this.textoError(e, 'No se pudo guardar el usuario.'));
      },
    });
  }

  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar a ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`)) return;
    this.limpiarAvisos();
    this.usuarioService.eliminar(u.id).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado.');
        this.cargarUsuarios();
      },
      error: (e) => this.error.set(this.textoError(e, 'No se pudo eliminar el usuario.')),
    });
  }

  // ---------- ayudas de la vista ----------
  invalido(campo: 'nombre' | 'apellido' | 'email' | 'telefono' | 'password' | 'rolId'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  esUsuarioActual(u: Usuario): boolean {
    return u.email.toLowerCase() === (this.auth.sesion()?.email ?? '').toLowerCase();
  }

  etiquetaRol(nombreRol?: string): string {
    return (nombreRol ?? '').replace('ROLE_', '');
  }

  private limpiarAvisos(): void {
    this.error.set('');
    this.mensaje.set('');
  }

  // usa el mensaje que manda Spring (ErrorResponseDTO.message) si existe
  private textoError(e: HttpErrorResponse, porDefecto: string): string {
    if (e.status === 0) return 'No hay conexión con el servidor. ¿Está corriendo Spring Boot?';
    if (e.status === 403) return 'No tienes permiso para esta acción.';
    return e.error?.message || porDefecto;
  }
}
