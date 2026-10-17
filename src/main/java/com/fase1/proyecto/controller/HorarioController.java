package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.horario.HorarioResponseDTO;
import com.fase1.proyecto.exception.ResourceNotFoundException;
import com.fase1.proyecto.service.HorarioService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping
    public List<HorarioResponseDTO> listar() {
        return horarioService.listar();
    }

    @GetMapping("/{id}")
    public HorarioResponseDTO buscarPorId(@PathVariable Integer id) {
        return horarioService.buscarPorId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un horario con id " + id));
    }
}
