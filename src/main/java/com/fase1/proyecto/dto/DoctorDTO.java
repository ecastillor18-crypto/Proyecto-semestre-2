package com.fase1.proyecto.dto;

import com.fase1.proyecto.modelos.Medico;
import java.util.List;
import java.util.stream.Collectors;

public class DoctorDTO {

    private Integer id;
    private String nombreCompleto;
    private String email;
    private String numeroColegiado;
    private Integer aniosExperiencia;
    private String biografia;
    private List<EspecialidadDTO> especialidades;

    public DoctorDTO() {
    }

    public static DoctorDTO fromEntity(Medico medico) {
        DoctorDTO dto = new DoctorDTO();
        dto.id = medico.getId();
        dto.email = medico.getUsuario() != null ? medico.getUsuario().getEmail() : null;
        dto.nombreCompleto = medico.getUsuario() != null
                ? medico.getUsuario().getNombre() + " " + medico.getUsuario().getApellido()
                : null;
        dto.numeroColegiado = medico.getNumeroColegiado();
        dto.aniosExperiencia = medico.getAniosExperiencia();
        dto.biografia = medico.getBiografia();
        dto.especialidades = medico.getEspecialidades().stream()
                .map(EspecialidadDTO::fromEntity)
                .collect(Collectors.toList());
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNumeroColegiado() {
        return numeroColegiado;
    }

    public void setNumeroColegiado(String numeroColegiado) {
        this.numeroColegiado = numeroColegiado;
    }

    public Integer getAniosExperiencia() {
        return aniosExperiencia;
    }

    public void setAniosExperiencia(Integer aniosExperiencia) {
        this.aniosExperiencia = aniosExperiencia;
    }

    public String getBiografia() {
        return biografia;
    }

    public void setBiografia(String biografia) {
        this.biografia = biografia;
    }

    public List<EspecialidadDTO> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(List<EspecialidadDTO> especialidades) {
        this.especialidades = especialidades;
    }
}
