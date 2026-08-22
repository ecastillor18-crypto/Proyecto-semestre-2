package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Horario;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorarioRepository extends JpaRepository<Horario, Integer> {

    List<Horario> findByEstadoAndMedico_IdAndFecha(
            Horario.EstadoHorario estado, Integer medicoId, LocalDate fecha);

    List<Horario> findByEstadoAndMedico_Id(Horario.EstadoHorario estado, Integer medicoId);

    List<Horario> findByEstadoAndFecha(Horario.EstadoHorario estado, LocalDate fecha);

    List<Horario> findByEstado(Horario.EstadoHorario estado);
}