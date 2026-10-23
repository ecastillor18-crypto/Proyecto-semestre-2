// especialidad tal como viene dentro de cada medico en GET /api/v1/doctors
export interface Especialidad {
  id: number;
  nombre: string;
}

// DoctorDTO de spring (el id es el medicoId que usa disponibilidad)
export interface Doctor {
  id: number;
  nombreCompleto: string | null;
  email: string | null;
  numeroColegiado: string | null;
  aniosExperiencia: number | null;
  biografia: string | null;
  especialidades: Especialidad[];
}
