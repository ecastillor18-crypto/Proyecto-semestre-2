package com.fase1.proyecto.dto;

import com.fase1.proyecto.modelos.Cita;
import java.time.LocalDate;
import java.time.LocalTime;

public record CitaResponseDTO(
        Integer id,
        Integer pacienteId,
        Integer medicoId,
        Integer horarioId,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        Cita.EstadoCita estado,
        String motivo,
        String diagnostico,
        String receta)
        
        
        {

    public static CitaResponseDTO fromEntity(Cita cita) {
      return new CitaResponseDTO(
        cita.getId(),
        cita.getPaciente().getId(),
        cita.getMedico().getId(),
        cita.getHorario().getId(),
        cita.getHorario().getFecha(),
        cita.getHorario().getHoraInicio(),
        cita.getHorario().getHoraFin(),
        cita.getEstado(),
        cita.getMotivo(),
        cita.getDiagnostico(),
        cita.getReceta());
    }
}