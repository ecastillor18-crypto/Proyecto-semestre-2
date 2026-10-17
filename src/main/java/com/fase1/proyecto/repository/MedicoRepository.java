package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Medico;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    @Query("SELECT DISTINCT m FROM Medico m ORDER BY m.usuario.nombre, m.usuario.apellido")
    List<Medico> findAllWithDetails();

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    @Query("SELECT DISTINCT m FROM Medico m WHERE m.id = :id")
    Optional<Medico> findByIdWithDetails(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    @Query("SELECT DISTINCT m FROM Medico m JOIN m.especialidades e WHERE e.id = :especialidadId")
    List<Medico> findByEspecialidadId(@Param("especialidadId") Integer especialidadId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "usuario")
    @Query("SELECT m FROM Medico m WHERE m.id = :id")
    Optional<Medico> findByIdForUpdate(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    Optional<Medico> findByUsuario_Id(Integer usuarioId);
}
