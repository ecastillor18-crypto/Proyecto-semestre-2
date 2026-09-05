package com.fase1.proyecto.exception;

public class BusinessConflictException extends RuntimeException {

    public BusinessConflictException(String mensaje) {
        super(mensaje);
    }
}