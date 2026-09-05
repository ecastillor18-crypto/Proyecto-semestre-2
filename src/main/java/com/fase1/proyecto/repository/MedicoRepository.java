package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Medico;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    @Query("SELECT DISTINCT m FROM Medico m")
    List<Medico> findAllWithDetails();

    @EntityGraph(attributePaths = {"usuario", "especialidades"})
    @Query("SELECT DISTINCT m FROM Medico m JOIN m.especialidades e WHERE e.id = :especialidadId")
    List<Medico> findByEspecialidadId(@Param("especialidadId") Integer especialidadId);

    @EntityGraph(attributePaths = "especialidades")
    Optional<Medico> findByUsuario_Id(Integer usuarioId);
}
