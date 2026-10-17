package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.horario.HorarioRequestDTO;
import com.fase1.proyecto.dto.horario.HorarioResponseDTO;
import com.fase1.proyecto.service.HorarioService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final HorarioService horarioService;

    public ScheduleController(HorarioService horarioService) {
        this.horarioService = horarioService;
    }

    @GetMapping("/available")
    public List<HorarioResponseDTO> disponibles(
            @RequestParam(required = false) Integer medicoId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return horarioService.buscarDisponibles(medicoId, fecha).stream()
                .map(HorarioResponseDTO::fromEntity)
                .toList();
    }

    @GetMapping("/manage")
    public List<HorarioResponseDTO> gestionar(
            @RequestParam(required = false) Integer medicoId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @AuthenticationPrincipal Jwt jwt) {
        return horarioService.listarGestion(
                userId(jwt),
                hasRole(jwt, "ROLE_ADMIN"),
                medicoId,
                fecha);
    }

    @PostMapping
    public ResponseEntity<HorarioResponseDTO> crear(
            @Valid @RequestBody HorarioRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        HorarioResponseDTO response = horarioService.crear(
                request,
                userId(jwt),
                hasRole(jwt, "ROLE_ADMIN"));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public HorarioResponseDTO actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody HorarioRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        return horarioService.actualizar(
                id,
                request,
                userId(jwt),
                hasRole(jwt, "ROLE_ADMIN"));
    }

    @PatchMapping("/{id}/cancel")
    public HorarioResponseDTO cancelar(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {
        return horarioService.cancelar(
                id,
                userId(jwt),
                hasRole(jwt, "ROLE_ADMIN"));
    }

    private Integer userId(Jwt jwt) {
        Object value = jwt.getClaim("userId");
        if (value instanceof Number number) {
            return number.intValue();
        }
        throw new IllegalArgumentException("El JWT no contiene un userId válido");
    }

    private boolean hasRole(Jwt jwt, String role) {
        Object claim = jwt.getClaim("roles");
        return claim instanceof Collection<?> roles && roles.contains(role);
    }
}
