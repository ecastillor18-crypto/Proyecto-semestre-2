package com.fase1.proyecto.dto;

import com.fase1.proyecto.modelos.Especialidad;

public class EspecialidadDTO {

    private Integer id;
    private String nombre;

    public EspecialidadDTO() {
    }

    public EspecialidadDTO(Integer id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    public static EspecialidadDTO fromEntity(Especialidad especialidad) {
        return new EspecialidadDTO(especialidad.getId(), especialidad.getNombre());
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
