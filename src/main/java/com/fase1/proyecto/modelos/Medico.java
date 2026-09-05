package com.fase1.proyecto.modelos;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "medicos")
public class Medico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "numero_colegiado", nullable = false, unique = true, length = 30)
    private String numeroColegiado;

    @Column(name = "anios_experiencia", nullable = false)
    private Integer aniosExperiencia;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    @ManyToMany
    @JoinTable(
        name = "medico_especialidad",
        joinColumns = @JoinColumn(name = "medico_id"),
        inverseJoinColumns = @JoinColumn(name = "especialidad_id")
    )
    private Set<Especialidad> especialidades = new HashSet<>();

    public Medico() {
    }

    public Medico(Usuario usuario, String numeroColegiado, Integer aniosExperiencia, String biografia) {
        this.usuario = usuario;
        this.numeroColegiado = numeroColegiado;
        this.aniosExperiencia = aniosExperiencia;
        this.biografia = biografia;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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

    public Set<Especialidad> getEspecialidades() {
        return especialidades;
    }

    public void setEspecialidades(Set<Especialidad> especialidades) {
        this.especialidades = especialidades;
    }
}