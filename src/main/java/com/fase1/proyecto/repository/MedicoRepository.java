package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Medico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    @Query("SELECT DISTINCT m FROM Medico m JOIN m.especialidades e WHERE e.id = :especialidadId")
    List<Medico> findByEspecialidadId(@Param("especialidadId") Integer especialidadId);
}
