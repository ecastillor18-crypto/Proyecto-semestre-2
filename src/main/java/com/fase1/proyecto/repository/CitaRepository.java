package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Cita;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CitaRepository extends JpaRepository<Cita, Integer> {

    @EntityGraph(attributePaths = {"paciente", "medico", "medico.usuario", "horario"})
    @Query("SELECT c FROM Cita c ORDER BY c.horario.fecha DESC, c.horario.horaInicio DESC")
    List<Cita> findAllWithDetails();

    @EntityGraph(attributePaths = {"paciente", "medico", "medico.usuario", "horario"})
    @Query("SELECT c FROM Cita c WHERE c.id = :id")
    Optional<Cita> findByIdWithDetails(@Param("id") Integer id);

    boolean existsByHorario_IdAndEstado(Integer horarioId, Cita.EstadoCita estado);

    @Query("""
            SELECT COUNT(c)
            FROM Cita c
            WHERE c.paciente.id = :pacienteId
              AND c.estado = :estado
              AND c.horario.fecha = :fecha
              AND c.horario.horaInicio < :horaFin
              AND c.horario.horaFin > :horaInicio
            """)
    long countCrucesPaciente(
            @Param("pacienteId") Integer pacienteId,
            @Param("estado") Cita.EstadoCita estado,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin);

    @EntityGraph(attributePaths = {"paciente", "medico", "medico.usuario", "horario"})
    @Query("""
            SELECT c FROM Cita c
            WHERE c.paciente.id = :pacienteId
            ORDER BY c.horario.fecha DESC, c.horario.horaInicio DESC
            """)
    List<Cita> findByPacienteWithDetails(@Param("pacienteId") Integer pacienteId);

    @EntityGraph(attributePaths = {"paciente", "medico", "medico.usuario", "horario"})
    @Query("""
            SELECT c FROM Cita c
            WHERE c.medico.id = :medicoId
              AND (:fecha IS NULL OR c.horario.fecha = :fecha)
            ORDER BY c.horario.fecha DESC, c.horario.horaInicio DESC
            """)
    List<Cita> findByMedicoWithDetails(
            @Param("medicoId") Integer medicoId,
            @Param("fecha") LocalDate fecha);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"paciente", "medico", "medico.usuario", "horario"})
    @Query("SELECT c FROM Cita c WHERE c.id = :id")
    Optional<Cita> findByIdForUpdate(@Param("id") Integer id);
}
