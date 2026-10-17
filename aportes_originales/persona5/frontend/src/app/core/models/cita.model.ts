export type EstadoCita = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  medicoId: number;
  medicoNombre: string;
  horarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  motivo: string;
  diagnostico: string | null;
  receta: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface DiagnosticoRequest {
  diagnostico: string;
  receta?: string | null;
}
