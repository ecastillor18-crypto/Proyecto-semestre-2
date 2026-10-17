import { Especialidad } from './especialidad.model';

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

export interface MedicoRequest {
  usuarioId: number;
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia?: string | null;
  especialidadIds: number[];
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
