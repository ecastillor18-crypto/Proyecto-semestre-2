package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.DiagnosticoRequestDTO;
import com.fase1.proyecto.dto.CitaRequestDTO;
import com.fase1.proyecto.dto.CitaResponseDTO;
import com.fase1.proyecto.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final CitaService citaService;

    public AppointmentController(CitaService citaService) {
        this.citaService = citaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CitaResponseDTO reservar(@Valid @RequestBody CitaRequestDTO request) {
        return CitaResponseDTO.fromEntity(citaService.reservar(request));
    }

    @PutMapping("/{id}/diagnosis")
    public CitaResponseDTO registrarDiagnostico(
            @PathVariable Integer id,
            @Valid @RequestBody DiagnosticoRequestDTO request) {

        return CitaResponseDTO.fromEntity(
                citaService.registrarDiagnostico(id, request));
    }
}