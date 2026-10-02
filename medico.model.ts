import { Especialidad } from './especialidad.model';

/**
 * Forma en la que Spring Boot (Fase 2) devuelve la entidad Medico.
 * En la Fase 2 el usuario viene anidado dentro del medico.
 */
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

/**
 * Modelo mas comodo para mostrar el medico en la vista Angular.
 */
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

/**
 * Payload compatible con el MedicoController existente en Spring Boot Fase 2.
 * Todavia se envia la entidad con referencias por id porque el backend original
 * recibe @RequestBody Medico.
 */
export interface MedicoRequest {
  usuario: { id: number };
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Array<{ id: number }>;
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
