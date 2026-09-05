package com.fase1.proyecto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CitaRequestDTO {

    @NotNull(message = "El paciente es obligatorio")
    private Integer pacienteId;

    @NotNull(message = "El médico es obligatorio")
    private Integer medicoId;

    @NotNull(message = "El horario es obligatorio")
    private Integer horarioId;

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 255, message = "El motivo no puede superar 255 caracteres")
    private String motivo;

    public Integer getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Integer pacienteId) {
        this.pacienteId = pacienteId;
    }

    public Integer getMedicoId() {
        return medicoId;
    }

    public void setMedicoId(Integer medicoId) {
        this.medicoId = medicoId;
    }

    public Integer getHorarioId() {
        return horarioId;
    }

    public void setHorarioId(Integer horarioId) {
        this.horarioId = horarioId;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}