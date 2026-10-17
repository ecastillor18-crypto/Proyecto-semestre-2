package com.fase1.proyecto.dto.medico;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

public class MedicoAdminRequest {

    @NotNull(message = "El usuarioId es obligatorio")
    private Integer usuarioId;

    @NotBlank(message = "El número de colegiado es obligatorio")
    @Size(max = 30, message = "El número de colegiado no puede superar 30 caracteres")
    private String numeroColegiado;

    @NotNull(message = "Los años de experiencia son obligatorios")
    @Min(value = 0, message = "Los años de experiencia no pueden ser negativos")
    private Integer aniosExperiencia;

    @Size(max = 4000, message = "La biografía es demasiado larga")
    private String biografia;

    @NotEmpty(message = "Debe asignar al menos una especialidad")
    private Set<Integer> especialidadIds = new HashSet<>();

    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public String getNumeroColegiado() { return numeroColegiado; }
    public void setNumeroColegiado(String numeroColegiado) { this.numeroColegiado = numeroColegiado; }
    public Integer getAniosExperiencia() { return aniosExperiencia; }
    public void setAniosExperiencia(Integer aniosExperiencia) { this.aniosExperiencia = aniosExperiencia; }
    public String getBiografia() { return biografia; }
    public void setBiografia(String biografia) { this.biografia = biografia; }
    public Set<Integer> getEspecialidadIds() { return especialidadIds; }
    public void setEspecialidadIds(Set<Integer> especialidadIds) {
        this.especialidadIds = especialidadIds == null ? new HashSet<>() : especialidadIds;
    }
}
