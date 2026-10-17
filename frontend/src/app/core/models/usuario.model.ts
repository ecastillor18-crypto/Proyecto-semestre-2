export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rolId: number;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono?: string | null;
  rolId: number;
  activo: boolean;
}
