package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Rol;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByNombreRol(String nombreRol);
}
