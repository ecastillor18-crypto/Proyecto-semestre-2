package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.medico.MedicoAdminRequest;
import com.fase1.proyecto.dto.medico.MedicoAdminResponse;
import com.fase1.proyecto.service.MedicoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {
    private final MedicoService medicoService;
    public MedicoController(MedicoService medicoService) { this.medicoService = medicoService; }

    @GetMapping public List<MedicoAdminResponse> listar() { return medicoService.listarAdmin(); }
    @GetMapping("/{id}") public MedicoAdminResponse buscar(@PathVariable Integer id) { return medicoService.buscarAdmin(id); }
    @PostMapping public ResponseEntity<MedicoAdminResponse> crear(@Valid @RequestBody MedicoAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.crear(request));
    }
    @PutMapping("/{id}") public MedicoAdminResponse actualizar(@PathVariable Integer id, @Valid @RequestBody MedicoAdminRequest request) {
        return medicoService.actualizar(id, request);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        medicoService.eliminar(id); return ResponseEntity.noContent().build();
    }
}
