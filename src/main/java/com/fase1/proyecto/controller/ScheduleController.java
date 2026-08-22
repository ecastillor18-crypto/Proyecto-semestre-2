package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.HorarioDisponibleDTO;
import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.service.HorarioService;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Persona 4 - Endpoints REST básicos.
 * Endpoint de consulta pública de horarios disponibles, filtrable por médico y fecha.
 */
@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final HorarioService horarioService;

    public ScheduleController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    /**
     * GET /api/v1/schedules/available
     * GET /api/v1/schedules/available?medicoId=3
     * GET /api/v1/schedules/available?fecha=2026-08-25
     * GET /api/v1/schedules/available?medicoId=3&fecha=2026-08-25
     */
    @GetMapping("/available")
    public List<HorarioDisponibleDTO> disponibles(
            @RequestParam(required = false) Integer medicoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        List<Horario> horarios = horarioService.buscarDisponibles(medicoId, fecha);
        return horarios.stream()
                .map(HorarioDisponibleDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
