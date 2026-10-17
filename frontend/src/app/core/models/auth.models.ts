export type Rol = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_PATIENT';

export interface LoginRequest {
  email: string;
  password: string;
}

// Respuesta real del backend Spring Boot de este proyecto.
// Se mantienen también los campos opcionales usados por la rama fase3/login-seguridad
// para que la integración sea compatible con ambas estructuras.
export interface LoginResponse {
  token: string;
  role: Rol;
  tokenType?: string;
  expiresIn?: number;
  userId?: number;
  usuario?: { id?: number; nombre?: string; apellido?: string; email?: string };
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface Sesion {
  token: string;
  role: Rol;
  id?: number;
  nombre: string;
  email: string;
}
