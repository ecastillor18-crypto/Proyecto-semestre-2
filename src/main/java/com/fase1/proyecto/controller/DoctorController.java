package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.DoctorDTO;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.service.MedicoService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Persona 4 - Endpoints REST básicos.
 * Endpoint de consulta pública de médicos, filtrable por especialidad.
 */
@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {

    private final MedicoService medicoService;

    public DoctorController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    /**
     * GET /api/v1/doctors
     * GET /api/v1/doctors?especialidadId=2
     */
    @GetMapping
    public List<DoctorDTO> listar(
            @RequestParam(required = false) Integer especialidadId) {
        List<Medico> medicos = medicoService.listar(especialidadId);
        return medicos.stream()
                .map(DoctorDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
