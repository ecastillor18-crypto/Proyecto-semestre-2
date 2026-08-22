package com.fase1.proyecto.repository;

import com.fase1.proyecto.modelos.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitaRepository extends JpaRepository<Cita, Integer> {
}