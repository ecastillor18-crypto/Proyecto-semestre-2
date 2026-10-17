package com.fase1.proyecto.dto.usuario;

import com.fase1.proyecto.modelos.Usuario;
import java.time.LocalDateTime;

public class UsuarioResponseDTO {

    private Integer id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private Integer rolId;
    private String rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.id = usuario.getId();
        dto.nombre = usuario.getNombre();
        dto.apellido = usuario.getApellido();
        dto.email = usuario.getEmail();
        dto.telefono = usuario.getTelefono();
        dto.rolId = usuario.getRol() != null ? usuario.getRol().getId() : null;
        dto.rol = usuario.getRol() != null ? usuario.getRol().getNombreRol() : null;
        dto.activo = usuario.getActivo();
        dto.fechaCreacion = usuario.getFechaCreacion();
        return dto;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public Integer getRolId() { return rolId; }
    public void setRolId(Integer rolId) { this.rolId = rolId; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
