package com.fase1.proyecto.exception;

/**
 * Se lanza cuando un recurso solicitado (médico, especialidad, horario, etc.)
 * no existe en la base de datos. El GlobalExceptionHandler la traduce a HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}
