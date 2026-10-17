package com.fase1.proyecto.dto.cita;

import com.fase1.proyecto.modelos.Cita;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class CitaResponseDTO {

    private Integer id;
    private Integer pacienteId;
    private String pacienteNombre;
    private Integer medicoId;
    private String medicoNombre;
    private Integer horarioId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String estado;
    private String motivo;
    private String diagnostico;
    private String receta;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public CitaResponseDTO() {
    }

    public static CitaResponseDTO fromEntity(Cita cita) {
        CitaResponseDTO dto = new CitaResponseDTO();
        dto.id = cita.getId();
        dto.pacienteId = cita.getPaciente().getId();
        dto.pacienteNombre = cita.getPaciente().getNombre() + " " + cita.getPaciente().getApellido();
        dto.medicoId = cita.getMedico().getId();
        dto.medicoNombre = cita.getMedico().getUsuario().getNombre() + " " + cita.getMedico().getUsuario().getApellido();
        dto.horarioId = cita.getHorario().getId();
        dto.fecha = cita.getHorario().getFecha();
        dto.horaInicio = cita.getHorario().getHoraInicio();
        dto.horaFin = cita.getHorario().getHoraFin();
        dto.estado = cita.getEstado().name();
        dto.motivo = cita.getMotivo();
        dto.diagnostico = cita.getDiagnostico();
        dto.receta = cita.getReceta();
        dto.fechaCreacion = cita.getFechaCreacion();
        dto.fechaActualizacion = cita.getFechaActualizacion();
        return dto;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getPacienteId() { return pacienteId; }
    public void setPacienteId(Integer pacienteId) { this.pacienteId = pacienteId; }
    public String getPacienteNombre() { return pacienteNombre; }
    public void setPacienteNombre(String pacienteNombre) { this.pacienteNombre = pacienteNombre; }
    public Integer getMedicoId() { return medicoId; }
    public void setMedicoId(Integer medicoId) { this.medicoId = medicoId; }
    public String getMedicoNombre() { return medicoNombre; }
    public void setMedicoNombre(String medicoNombre) { this.medicoNombre = medicoNombre; }
    public Integer getHorarioId() { return horarioId; }
    public void setHorarioId(Integer horarioId) { this.horarioId = horarioId; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }
    public String getReceta() { return receta; }
    public void setReceta(String receta) { this.receta = receta; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
