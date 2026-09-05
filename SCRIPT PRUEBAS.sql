-- Verificación manual de Base de Datos - Fase 1
USE citas_medicas;

-- 1) Catálogos obligatorios
SELECT id, nombre_rol, descripcion
FROM roles
ORDER BY id;

SELECT id, nombre, descripcion
FROM especialidades
ORDER BY id;

-- 2) Usuarios demo creados por Spring Boot cuando DEMO_DATA_ENABLED=true
SELECT u.id, u.nombre, u.apellido, u.email, r.nombre_rol, u.activo
FROM usuarios u
JOIN roles r ON r.id = u.rol_id
ORDER BY u.id;

-- 3) Médicos y especialidades
SELECT m.id AS medico_id,
       CONCAT(u.nombre, ' ', u.apellido) AS medico,
       m.numero_colegiado,
       e.nombre AS especialidad
FROM medicos m
JOIN usuarios u ON u.id = m.usuario_id
LEFT JOIN medico_especialidad me ON me.medico_id = m.id
LEFT JOIN especialidades e ON e.id = me.especialidad_id
ORDER BY m.id, e.nombre;

-- 4) Horarios disponibles
SELECT h.id, h.medico_id, h.fecha, h.hora_inicio, h.hora_fin, h.estado
FROM horarios_disponibles h
WHERE h.estado = 'DISPONIBLE'
ORDER BY h.fecha, h.hora_inicio;

-- 5) Integridad básica: un horario no puede aparecer en más de una cita.
SELECT horario_id, COUNT(*) AS cantidad
FROM citas_medicas
GROUP BY horario_id
HAVING COUNT(*) > 1;
-- Resultado esperado: 0 filas.
