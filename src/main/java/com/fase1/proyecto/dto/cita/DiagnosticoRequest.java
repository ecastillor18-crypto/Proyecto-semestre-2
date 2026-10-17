package com.fase1.proyecto.dto.cita;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DiagnosticoRequest {

    @NotBlank(message = "El diagnóstico es obligatorio")
    @Size(max = 4000, message = "El diagnóstico es demasiado largo")
    private String diagnostico;

    @Size(max = 4000, message = "La receta es demasiado larga")
    private String receta;

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }
    public String getReceta() { return receta; }
    public void setReceta(String receta) { this.receta = receta; }
}
