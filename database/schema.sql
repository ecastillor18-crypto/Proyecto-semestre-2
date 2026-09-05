-- ============================================================================
-- ENTREGABLE FASE 1 - schema.sql
-- Sistema de Citas Médicas - MySQL 8+
-- ============================================================================
CREATE DATABASE IF NOT EXISTS citas_medicas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE citas_medicas;

-- ============================================================================
-- Sistema de Citas Médicas - Fase 1
-- Esquema relacional normalizado (3FN) para MySQL 8+
-- Este archivo se ejecuta automáticamente por Spring Boot sobre la BD
-- "citas_medicas" ya creada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NULL,
    rol_id INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_usuarios_rol (rol_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    numero_colegiado VARCHAR(30) NOT NULL UNIQUE,
    anios_experiencia INT NOT NULL DEFAULT 0,
    biografia TEXT NULL,
    CONSTRAINT fk_medicos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT chk_medicos_experiencia CHECK (anios_experiencia >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medico_especialidad (
    medico_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    PRIMARY KEY (medico_id, especialidad_id),
    CONSTRAINT fk_medico_especialidad_medico
        FOREIGN KEY (medico_id) REFERENCES medicos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_medico_especialidad_especialidad
        FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('DISPONIBLE', 'RESERVADO', 'CANCELADO') NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT fk_horarios_medico
        FOREIGN KEY (medico_id) REFERENCES medicos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT uq_horarios_medico_bloque UNIQUE (medico_id, fecha, hora_inicio),
    CONSTRAINT chk_horarios_rango CHECK (hora_fin > hora_inicio),
    INDEX idx_horarios_medico_fecha (medico_id, fecha),
    INDEX idx_horarios_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS citas_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    horario_id INT NOT NULL UNIQUE,
    estado ENUM('PENDIENTE', 'COMPLETADA', 'CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
    motivo VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_paciente
        FOREIGN KEY (paciente_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_citas_medico
        FOREIGN KEY (medico_id) REFERENCES medicos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_citas_horario
        FOREIGN KEY (horario_id) REFERENCES horarios_disponibles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_citas_paciente (paciente_id),
    INDEX idx_citas_medico (medico_id),
    INDEX idx_citas_estado (estado)
) ENGINE=InnoDB;

-- Catálogos mínimos definidos en el alcance de Fase 1.
INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('ROLE_ADMIN', 'Administrador del sistema'),
    ('ROLE_DOCTOR', 'Médico'),
    ('ROLE_PATIENT', 'Paciente')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Medicina General', 'Atención médica general'),
    ('Pediatría', 'Atención médica infantil'),
    ('Cardiología', 'Diagnóstico y tratamiento cardiovascular')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
