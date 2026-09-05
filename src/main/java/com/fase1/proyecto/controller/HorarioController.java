package com.fase1.proyecto.controller;

import com.fase1.proyecto.modelos.Horario;
import com.fase1.proyecto.service.HorarioService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/horarios")
public class HorarioController {

    private final HorarioService horarioService;

    public HorarioController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping
    public List<Horario> listar() {
        return horarioService.listar();
    }

    @GetMapping("/{id}")
    public Horario buscarPorId(@PathVariable Integer id) {
        return horarioService.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Horario guardar(@RequestBody Horario horario) {
        return horarioService.guardar(horario);
    }

    @PutMapping("/{id}")
    public Horario actualizar(@PathVariable Integer id, @RequestBody Horario horario) {
        horario.setId(id);
        return horarioService.guardar(horario);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        horarioService.eliminar(id);
    }
}