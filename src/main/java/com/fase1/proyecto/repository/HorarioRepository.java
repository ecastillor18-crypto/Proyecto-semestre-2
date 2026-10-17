package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Horario;
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

public interface HorarioRepository extends JpaRepository<Horario, Integer> {

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    @Query("SELECT h FROM Horario h ORDER BY h.fecha DESC, h.horaInicio DESC")
    List<Horario> findAllWithDetails();

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    @Query("SELECT h FROM Horario h WHERE h.id = :id")
    Optional<Horario> findByIdWithDetails(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoAndMedico_IdAndFechaOrderByHoraInicioAsc(
            Horario.EstadoHorario estado, Integer medicoId, LocalDate fecha);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoAndMedico_IdOrderByFechaAscHoraInicioAsc(
            Horario.EstadoHorario estado, Integer medicoId);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoAndFechaOrderByHoraInicioAsc(
            Horario.EstadoHorario estado, LocalDate fecha);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoOrderByFechaAscHoraInicioAsc(Horario.EstadoHorario estado);


    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    @Query("""
            SELECT h FROM Horario h
            WHERE (:medicoId IS NULL OR h.medico.id = :medicoId)
              AND (:fecha IS NULL OR h.fecha = :fecha)
            ORDER BY h.fecha DESC, h.horaInicio DESC
            """)
    List<Horario> findForManagement(
            @Param("medicoId") Integer medicoId,
            @Param("fecha") LocalDate fecha);

    boolean existsByMedico_IdAndFechaAndHoraInicio(Integer medicoId, LocalDate fecha, LocalTime horaInicio);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    Optional<Horario> findByMedico_IdAndFechaAndHoraInicio(
            Integer medicoId, LocalDate fecha, LocalTime horaInicio);

    @Query("""
            SELECT COUNT(h)
            FROM Horario h
            WHERE h.medico.id = :medicoId
              AND h.fecha = :fecha
              AND h.estado <> :estadoCancelado
              AND (:excludeId IS NULL OR h.id <> :excludeId)
              AND h.horaInicio < :horaFin
              AND h.horaFin > :horaInicio
            """)
    long countCruces(
            @Param("medicoId") Integer medicoId,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin,
            @Param("excludeId") Integer excludeId,
            @Param("estadoCancelado") Horario.EstadoHorario estadoCancelado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    @Query("SELECT h FROM Horario h WHERE h.id = :id")
    Optional<Horario> findByIdForUpdate(@Param("id") Integer id);
}
