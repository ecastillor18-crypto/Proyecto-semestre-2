export interface Rol {
  id: number;
  nombreRol: string;
  descripcion?: string | null;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: Rol;
  activo: boolean;
  fechaCreacion?: string;
}

export interface UsuarioPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  passwordHash?: string;
  rol: { id: number };
  activo: boolean;
}
