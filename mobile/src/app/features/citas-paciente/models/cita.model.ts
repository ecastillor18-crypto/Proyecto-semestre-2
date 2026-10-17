export type EstadoCita = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

/** Respuesta real de CitaResponseDTO del backend. */
export interface CitaPaciente {
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
