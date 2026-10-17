export type EstadoHorario = 'DISPONIBLE' | 'RESERVADO' | 'CANCELADO';

export interface Horario {
  id: number;
  medicoId: number;
  nombreMedico: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoHorario;
}

export interface HorarioRequest {
  medicoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}
