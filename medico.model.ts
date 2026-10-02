import { Especialidad } from './especialidad.model';

/** Respuesta real de /api/medicos en la Fase 2. */
export interface MedicoApi {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Especialidad[];
}

/** Modelo cómodo para la tabla de Angular. */
export interface MedicoAdmin {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Especialidad[];
}

/** Payload compatible con MedicoController de Spring Boot Fase 2. */
export interface MedicoRequest {
  usuario: { id: number };
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Array<{ id: number }>;
}

/** Respuesta del endpoint administrativo /api/usuarios usada solo para elegir doctores. */
export interface UsuarioDoctorApi {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  rol: {
    id: number;
    nombreRol: string;
    descripcion?: string | null;
  };
}

export interface DoctorPublico {
  id: number;
  email: string;
  nombreCompleto: string;
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Especialidad[];
}
