package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Especialidad;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {

    Optional<Especialidad> findByNombreIgnoreCase(String nombre);
}
