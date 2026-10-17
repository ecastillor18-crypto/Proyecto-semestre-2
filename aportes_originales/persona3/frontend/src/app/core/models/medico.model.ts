import { Especialidad } from './especialidad.model';

/**
 * Datos que Angular recibe del backend para mostrar
 * el perfil profesional de un médico.
 *
 * En este primer avance solo se modela la lectura.
 * El DTO para crear/editar médicos se agregará después.
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
 * Modelo de lectura del catálogo público de doctores.
 */
export interface DoctorPublico {
  id: number;
  email: string;
  nombreCompleto: string;
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Especialidad[];
}
