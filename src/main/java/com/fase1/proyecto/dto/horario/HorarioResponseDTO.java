package com.fase1.proyecto.dto.horario;

import com.fase1.proyecto.modelos.Horario;
import java.time.LocalDate;
import java.time.LocalTime;

public class HorarioResponseDTO {

    private Integer id;
    private Integer medicoId;
    private String nombreMedico;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String estado;

    public HorarioResponseDTO() {
    }

    public static HorarioResponseDTO fromEntity(Horario horario) {
        HorarioResponseDTO dto = new HorarioResponseDTO();
        dto.id = horario.getId();
        dto.medicoId = horario.getMedico().getId();
        dto.nombreMedico = horario.getMedico().getUsuario().getNombre() + " " + horario.getMedico().getUsuario().getApellido();
        dto.fecha = horario.getFecha();
        dto.horaInicio = horario.getHoraInicio();
        dto.horaFin = horario.getHoraFin();
        dto.estado = horario.getEstado().name();
        return dto;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getMedicoId() { return medicoId; }
    public void setMedicoId(Integer medicoId) { this.medicoId = medicoId; }
    public String getNombreMedico() { return nombreMedico; }
    public void setNombreMedico(String nombreMedico) { this.nombreMedico = nombreMedico; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
