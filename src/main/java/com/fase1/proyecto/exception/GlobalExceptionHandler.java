package com.fase1.proyecto.exception;

import com.fase1.proyecto.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Manejo global de excepciones para los endpoints REST (Persona 4).
 * Centraliza el formato de las respuestas de error para toda la API.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.BAD_REQUEST.value(), "Datos inválidos", mensaje, request.getRequestURI());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BusinessConflictException.class)
    public ResponseEntity<ErrorResponseDTO> handleConflict(
            BusinessConflictException ex, HttpServletRequest request) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.CONFLICT.value(), "Conflicto", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }


    // 401 - Credenciales incorrectas o usuario deshabilitado durante el login
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.UNAUTHORIZED.value(),
                "No autorizado",
                "Credenciales inválidas",
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    // 404 - Recurso no encontrado (ej. especialidadId o medicoId que no existe)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.NOT_FOUND.value(),
                "Recurso no encontrado",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 400 - Parámetro con tipo/formato inválido (ej. ?fecha=abc en vez de una fecha real)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String mensaje = "El parámetro '" + ex.getName() + "' tiene un formato inválido: '"
                + ex.getValue() + "'";
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.BAD_REQUEST.value(),
                "Parámetro inválido",
                mensaje,
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 400 - Argumentos inválidos lanzados manualmente desde los services
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.BAD_REQUEST.value(),
                "Solicitud inválida",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 500 - Cualquier otro error no controlado (fallback de seguridad)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex, HttpServletRequest request) {
        ErrorResponseDTO body = new ErrorResponseDTO(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Error interno del servidor",
                "Ocurrió un error inesperado. Contacta al equipo de backend si persiste.",
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
