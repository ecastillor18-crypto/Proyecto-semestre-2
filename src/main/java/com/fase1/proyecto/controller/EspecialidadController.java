package com.fase1.proyecto.controller;

import com.fase1.proyecto.modelos.Especialidad;
import com.fase1.proyecto.service.EspecialidadService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    public EspecialidadController(EspecialidadService especialidadService) {
        this.especialidadService = especialidadService;
    }

    @GetMapping
    public List<Especialidad> listar() {
        return especialidadService.listar();
    }

    @GetMapping("/{id}")
    public Especialidad buscarPorId(@PathVariable Integer id) {
        return especialidadService.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Especialidad guardar(@RequestBody Especialidad especialidad) {
        return especialidadService.guardar(especialidad);
    }

    @PutMapping("/{id}")
    public Especialidad actualizar(@PathVariable Integer id, @RequestBody Especialidad especialidad) {
        especialidad.setId(id);
        return especialidadService.guardar(especialidad);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        especialidadService.eliminar(id);
    }
}