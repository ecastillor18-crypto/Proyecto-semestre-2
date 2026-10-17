package com.fase1.proyecto.dto.medico;

import com.fase1.proyecto.dto.EspecialidadDTO;
import com.fase1.proyecto.modelos.Medico;
import java.util.List;

public class MedicoAdminResponse {

    private Integer id;
    private Integer usuarioId;
    private String nombreCompleto;
    private String email;
    private String numeroColegiado;
    private Integer aniosExperiencia;
    private String biografia;
    private List<EspecialidadDTO> especialidades;

    public static MedicoAdminResponse fromEntity(Medico medico) {
        MedicoAdminResponse dto = new MedicoAdminResponse();
        dto.id = medico.getId();
        dto.usuarioId = medico.getUsuario().getId();
        dto.nombreCompleto = medico.getUsuario().getNombre() + " " + medico.getUsuario().getApellido();
        dto.email = medico.getUsuario().getEmail();
        dto.numeroColegiado = medico.getNumeroColegiado();
        dto.aniosExperiencia = medico.getAniosExperiencia();
        dto.biografia = medico.getBiografia();
        dto.especialidades = medico.getEspecialidades().stream()
                .map(EspecialidadDTO::fromEntity)
                .sorted((a, b) -> a.getNombre().compareToIgnoreCase(b.getNombre()))
                .toList();
        return dto;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getNumeroColegiado() { return numeroColegiado; }
    public void setNumeroColegiado(String numeroColegiado) { this.numeroColegiado = numeroColegiado; }
    public Integer getAniosExperiencia() { return aniosExperiencia; }
    public void setAniosExperiencia(Integer aniosExperiencia) { this.aniosExperiencia = aniosExperiencia; }
    public String getBiografia() { return biografia; }
    public void setBiografia(String biografia) { this.biografia = biografia; }
    public List<EspecialidadDTO> getEspecialidades() { return especialidades; }
    public void setEspecialidades(List<EspecialidadDTO> especialidades) { this.especialidades = especialidades; }
}
