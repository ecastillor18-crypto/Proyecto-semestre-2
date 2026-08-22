
USE citas_medicas;
SET NAMES utf8mb4;


-- 3 médicos
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol_id, activo) VALUES
('Ana', 'Gómez', 'ana.gomez@clinica.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5511-2233', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_DOCTOR'), TRUE),
('Carlos', 'Ramírez', 'carlos.ramirez@clinica.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5522-3344', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_DOCTOR'), TRUE),
('Lucía', 'Fernández', 'lucia.fernandez@clinica.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5533-4455', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_DOCTOR'), TRUE);

-- 2 pacientes
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol_id, activo) VALUES
('Juan', 'Pérez', 'juan.perez@correo.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5544-5566', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_PATIENT'), TRUE),
('María', 'López', 'maria.lopez@correo.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5555-6677', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_PATIENT'), TRUE);

-- 1 admin (opcional, útil para probar endpoints de administración más adelante)
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol_id, activo) VALUES
('Admin', 'Sistema', 'admin@clinica.com', '$2a$10$TESTHASHTESTHASHTESTHASHTESTHASHTESTHASHTESTHASH', '5500-0000', (SELECT id FROM roles WHERE nombre_rol = 'ROLE_ADMIN'), TRUE);


INSERT INTO medicos (usuario_id, numero_colegiado, anios_experiencia, biografia) VALUES
((SELECT id FROM usuarios WHERE email = 'ana.gomez@clinica.com'), 'COL-1001', 8, 'Médica general con enfoque en atención primaria y medicina preventiva.'),
((SELECT id FROM usuarios WHERE email = 'carlos.ramirez@clinica.com'), 'COL-1002', 5, 'Pediatra dedicado al cuidado de niños desde recién nacidos hasta adolescentes.'),
((SELECT id FROM usuarios WHERE email = 'lucia.fernandez@clinica.com'), 'COL-1003', 12, 'Cardióloga con experiencia en diagnóstico y tratamiento cardiovascular.');


INSERT INTO medico_especialidad (medico_id, especialidad_id) VALUES
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), (SELECT id FROM especialidades WHERE nombre = 'Medicina General')),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1002'), (SELECT id FROM especialidades WHERE nombre = 'Pediatría')),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003'), (SELECT id FROM especialidades WHERE nombre = 'Cardiología')),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003'), (SELECT id FROM especialidades WHERE nombre = 'Medicina General'));


-- Ana Gómez (COL-1001) - 25 y 26 de agosto de 2026
INSERT INTO horarios_disponibles (medico_id, fecha, hora_inicio, hora_fin, estado) VALUES
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), '2026-08-25', '08:00:00', '08:30:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), '2026-08-25', '08:30:00', '09:00:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), '2026-08-25', '09:00:00', '09:30:00', 'RESERVADO'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), '2026-08-26', '10:00:00', '10:30:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'), '2026-08-26', '10:30:00', '11:00:00', 'CANCELADO');

-- Carlos Ramírez (COL-1002) - 25 y 27 de agosto de 2026
INSERT INTO horarios_disponibles (medico_id, fecha, hora_inicio, hora_fin, estado) VALUES
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1002'), '2026-08-25', '14:00:00', '14:30:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1002'), '2026-08-27', '09:00:00', '09:30:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1002'), '2026-08-27', '09:30:00', '10:00:00', 'DISPONIBLE');

-- Lucía Fernández (COL-1003) - 26 de agosto de 2026
INSERT INTO horarios_disponibles (medico_id, fecha, hora_inicio, hora_fin, estado) VALUES
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003'), '2026-08-26', '15:00:00', '15:30:00', 'DISPONIBLE'),
((SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003'), '2026-08-26', '15:30:00', '16:00:00', 'RESERVADO');

INSERT INTO citas_medicas (paciente_id, medico_id, horario_id, estado, motivo) VALUES
(
    (SELECT id FROM usuarios WHERE email = 'juan.perez@correo.com'),
    (SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001'),
    (SELECT id FROM horarios_disponibles WHERE medico_id = (SELECT id FROM medicos WHERE numero_colegiado = 'COL-1001') AND fecha = '2026-08-25' AND hora_inicio = '09:00:00'),
    'PENDIENTE',
    'Consulta de control general'
),
(
    (SELECT id FROM usuarios WHERE email = 'maria.lopez@correo.com'),
    (SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003'),
    (SELECT id FROM horarios_disponibles WHERE medico_id = (SELECT id FROM medicos WHERE numero_colegiado = 'COL-1003') AND fecha = '2026-08-26' AND hora_inicio = '15:30:00'),
    'PENDIENTE',
    'Dolor en el pecho, revisión cardiológica'
);