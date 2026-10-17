package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.DoctorDTO;
import com.fase1.proyecto.modelos.Medico;
import com.fase1.proyecto.service.MedicoService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {

    private final MedicoService medicoService;

    public DoctorController(MedicoService medicoService) { this.medicoService = medicoService; }

    @GetMapping
    public List<DoctorDTO> listar(@RequestParam(required = false) Integer especialidadId) {
        return medicoService.listar(especialidadId).stream().map(DoctorDTO::fromEntity).toList();
    }

    @GetMapping("/me")
    public DoctorDTO miPerfil(@AuthenticationPrincipal Jwt jwt) {
        return DoctorDTO.fromEntity(medicoService.obtenerPorUsuario(userId(jwt)));
    }

    private Integer userId(Jwt jwt) {
        Object value = jwt.getClaim("userId");
        if (value instanceof Number number) return number.intValue();
        throw new IllegalArgumentException("El JWT no contiene un userId válido");
    }
}
