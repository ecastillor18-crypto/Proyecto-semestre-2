// lo que mando al backend cuando el paciente inicia sesion
export interface LoginRequest {
  email: string;
  password: string;
}

// lo que responde spring en /auth/login
// token y role los confirme en postman, los demas los dejo opcionales por si el backend no los manda
export interface LoginResponse {
  token: string;
  role: string;
  userId?: number;
  id?: number;
  email?: string;
}

// lo que guardo en el telefono para recordar la sesion
export interface AuthSession {
  token: string;
  role: string;
  userId: number | null;
  email: string;
}
