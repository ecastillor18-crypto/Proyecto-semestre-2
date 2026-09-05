package com.fase1.proyecto.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> inicio() {
        return Map.of(
                "aplicacion", "Sistema de Citas Médicas",
                "estado", "activo",
                "documentacion", "/swagger-ui.html",
                "horariosDisponibles", "/api/v1/schedules/available");
    }
}