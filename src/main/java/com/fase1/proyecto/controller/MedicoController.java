package com.fase1.proyecto.controller;

import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.service.MedicoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @GetMapping
    public List<Medico> listar() {
        return medicoService.listar();
    }

    @GetMapping("/{id}")
    public Medico buscarPorId(@PathVariable Integer id) {
        return medicoService.buscarPorId(id).orElse(null);
    }

    @PostMapping
    public Medico guardar(@RequestBody Medico medico) {
        return medicoService.guardar(medico);
    }

    @PutMapping("/{id}")
    public Medico actualizar(@PathVariable Integer id, @RequestBody Medico medico) {
        medico.setId(id);
        return medicoService.guardar(medico);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        medicoService.eliminar(id);
    }
}