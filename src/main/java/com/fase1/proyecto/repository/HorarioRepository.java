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
    List<Horario> findByEstadoAndMedico_IdAndFecha(
            Horario.EstadoHorario estado, Integer medicoId, LocalDate fecha);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoAndMedico_Id(Horario.EstadoHorario estado, Integer medicoId);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstadoAndFecha(Horario.EstadoHorario estado, LocalDate fecha);

    @EntityGraph(attributePaths = {"medico", "medico.usuario"})
    List<Horario> findByEstado(Horario.EstadoHorario estado);

    boolean existsByMedico_IdAndFechaAndHoraInicio(Integer medicoId, LocalDate fecha, LocalTime horaInicio);

        @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Horario h "
            + "WHERE h.medico.id = :medicoId AND h.fecha = :fecha "
            + "AND h.horaInicio < :horaFin AND h.horaFin > :horaInicio")
        boolean existsOverlapping(
            @Param("medicoId") Integer medicoId,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin);

        @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM Horario h "
            + "WHERE h.id <> :id AND h.medico.id = :medicoId AND h.fecha = :fecha "
            + "AND h.horaInicio < :horaFin AND h.horaFin > :horaInicio")
        boolean existsOverlappingExceptId(
            @Param("id") Integer id,
            @Param("medicoId") Integer medicoId,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Horario h WHERE h.id = :id")
    Optional<Horario> findByIdForUpdate(@Param("id") Integer id);
}
