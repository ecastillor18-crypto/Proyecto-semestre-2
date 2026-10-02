package com.fase1.proyecto.dto;

import jakarta.validation.constraints.NotBlank;

public class DiagnosticoRequestDTO {

    @NotBlank(message = "El diagnóstico es obligatorio")
    private String diagnostico;

    private String receta;

    public DiagnosticoRequestDTO() {
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getReceta() {
        return receta;
    }

    public void setReceta(String receta) {
        this.receta = receta;
    }
}