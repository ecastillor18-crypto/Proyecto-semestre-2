CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS especialidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    numero_colegiado VARCHAR(30) NOT NULL UNIQUE,
    anios_experiencia INT NOT NULL,
    biografia TEXT,
    CONSTRAINT fk_medicos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medico_especialidad (
    medico_id INT NOT NULL,
    especialidad_id INT NOT NULL,
    PRIMARY KEY (medico_id, especialidad_id),
    CONSTRAINT fk_medico_especialidad_medico FOREIGN KEY (medico_id) REFERENCES medicos (id),
    CONSTRAINT fk_medico_especialidad_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medico_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT fk_horarios_medico FOREIGN KEY (medico_id) REFERENCES medicos (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS citas_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    horario_id INT NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    motivo VARCHAR(255) NOT NULL,
    diagnostico TEXT,
    receta TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_citas_paciente FOREIGN KEY (paciente_id) REFERENCES usuarios (id),
    CONSTRAINT fk_citas_medico FOREIGN KEY (medico_id) REFERENCES medicos (id),
    CONSTRAINT fk_citas_horario FOREIGN KEY (horario_id) REFERENCES horarios_disponibles (id)
) ENGINE=InnoDB;

INSERT INTO roles (nombre_rol, descripcion) VALUES
    ('ROLE_ADMIN', 'Administrador del sistema'),
    ('ROLE_DOCTOR', 'Medico'),
    ('ROLE_PATIENT', 'Paciente'),
    ('ROLE_SECRETARY', 'Secretario')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Medicina General', 'Atencion medica general'),
    ('Pediatría', 'Atencion medica infantil'),
    ('Cardiología', 'Diagnostico y tratamiento cardiovascular')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);
