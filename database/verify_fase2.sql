USE citas_medicas;

SELECT id, nombre_rol, descripcion
FROM roles
ORDER BY id;

SELECT id, nombre, descripcion
FROM especialidades
ORDER BY id;

SELECT u.id, u.nombre, u.apellido, u.email, r.nombre_rol, u.activo
FROM usuarios u
JOIN roles r ON r.id = u.rol_id
ORDER BY u.id;

SELECT m.id AS medico_id,
       CONCAT(u.nombre, ' ', u.apellido) AS medico,
       m.numero_colegiado,
       e.nombre AS especialidad
FROM medicos m
JOIN usuarios u ON u.id = m.usuario_id
LEFT JOIN medico_especialidad me ON me.medico_id = m.id
LEFT JOIN especialidades e ON e.id = me.especialidad_id
ORDER BY m.id, e.nombre;

SELECT h.id, h.medico_id, h.fecha, h.hora_inicio, h.hora_fin, h.estado
FROM horarios_disponibles h
ORDER BY h.fecha, h.hora_inicio;

SELECT c.id,
       c.paciente_id,
       c.medico_id,
       c.horario_id,
       c.estado,
       c.motivo,
       h.fecha,
       h.hora_inicio,
       h.hora_fin
FROM citas_medicas c
JOIN horarios_disponibles h ON h.id = c.horario_id
ORDER BY c.id DESC;

SELECT horario_id, COUNT(*) AS citas_activas
FROM citas_medicas
WHERE estado = 'PENDIENTE'
GROUP BY horario_id
HAVING COUNT(*) > 1;
