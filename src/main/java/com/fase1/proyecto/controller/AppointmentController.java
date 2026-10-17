package com.fase1.proyecto.controller;

import com.fase1.proyecto.dto.cita.CitaCreateRequest;
import com.fase1.proyecto.dto.cita.CitaResponseDTO;
import com.fase1.proyecto.dto.cita.DiagnosticoRequest;
import com.fase1.proyecto.service.CitaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    private final CitaService citaService;

    public AppointmentController(CitaService citaService) {
        this.citaService = citaService;
    }

    @PostMapping
    public ResponseEntity<CitaResponseDTO> reservar(
            @Valid @RequestBody CitaCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        CitaResponseDTO response = citaService.reservar(userId(jwt), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping({"/my", "/my-history"})
    public List<CitaResponseDTO> misCitas(@AuthenticationPrincipal Jwt jwt) {
        return citaService.listarPaciente(userId(jwt));
    }

    @GetMapping("/doctor")
    public List<CitaResponseDTO> citasDoctor(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @AuthenticationPrincipal Jwt jwt) {
        return citaService.listarDoctor(userId(jwt), fecha);
    }

    @PatchMapping("/{id}/cancel")
    public CitaResponseDTO cancelar(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {
        return citaService.cancelar(
                id,
                userId(jwt),
                hasRole(jwt, "ROLE_ADMIN"));
    }

    @PutMapping("/{id}/diagnosis")
    public CitaResponseDTO registrarDiagnostico(
            @PathVariable Integer id,
            @Valid @RequestBody DiagnosticoRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return citaService.registrarDiagnostico(
                id, userId(jwt), hasRole(jwt, "ROLE_ADMIN"), request);
    }

    @PatchMapping("/{id}/complete")
    public CitaResponseDTO completar(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {
        return citaService.completar(
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
