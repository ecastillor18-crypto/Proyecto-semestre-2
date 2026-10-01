export type Rol = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_PATIENT';

export interface LoginRequest {
  email: string;
  password: string;
}

//lo que responde spring en /auth/login: token + rol + datos del usuario
//dejo los campos opcionales porque no se si el usuario viene anidado o suelto
export interface LoginResponse {
  token: string;
  role: Rol;
  usuario?: { id?: number; nombre?: string; apellido?: string; email?: string };
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

//lo que guardo en el navegador despues del login
export interface Sesion {
  token: string;
  role: Rol;
  id?: number;
  nombre: string;
  email: string;
}
