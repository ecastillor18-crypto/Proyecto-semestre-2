package com.fase1.proyecto.exception;

import com.fase1.proyecto.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDTO> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        return response(
                HttpStatus.UNAUTHORIZED,
                "No autorizado",
                "Credenciales inválidas",
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return response(
                HttpStatus.FORBIDDEN,
                "Acceso denegado",
                ex.getMessage(),
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return response(
                HttpStatus.NOT_FOUND,
                "Recurso no encontrado",
                ex.getMessage(),
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusinessRule(
            BusinessRuleException ex, HttpServletRequest request) {
        return response(
                HttpStatus.CONFLICT,
                "Conflicto de negocio",
                ex.getMessage(),
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(
                HttpStatus.BAD_REQUEST,
                "Validación fallida",
                "La solicitud contiene datos inválidos",
                request.getRequestURI(),
                errors);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDTO> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = "El parámetro '" + ex.getName() + "' tiene un formato inválido";
        return response(
                HttpStatus.BAD_REQUEST,
                "Parámetro inválido",
                message,
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return response(
                HttpStatus.BAD_REQUEST,
                "Solicitud inválida",
                ex.getMessage(),
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        return response(
                HttpStatus.CONFLICT,
                "Conflicto de datos",
                "La operación viola una restricción de integridad de la base de datos",
                request.getRequestURI(),
                null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGenericException(
            Exception ex, HttpServletRequest request) {
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor",
                "Ocurrió un error inesperado",
                request.getRequestURI(),
                null);
    }

    private ResponseEntity<ErrorResponseDTO> response(
            HttpStatus status,
            String error,
            String message,
            String path,
            Map<String, String> validationErrors) {
        return ResponseEntity.status(status).body(new ErrorResponseDTO(
                status.value(), error, message, path, validationErrors));
    }
}
