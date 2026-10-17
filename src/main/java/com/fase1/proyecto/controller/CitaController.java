package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.cita.CitaResponseDTO;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.service.CitaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
    public List<CitaResponseDTO> listar() {
        return citaService.listar();
    }

    @GetMapping("/{id}")
    public CitaResponseDTO buscarPorId(@PathVariable Integer id) {
        return citaService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una cita con id " + id));
    }
}
