USE citas_medicas;

-- Verificar columnas clínicas agregadas en Fase 3.
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'citas_medicas'
  AND TABLE_NAME = 'citas_medicas'
  AND COLUMN_NAME IN ('diagnostico', 'receta')
ORDER BY ORDINAL_POSITION;

-- Verificar roles base utilizados por Angular Guards y Spring Security.
SELECT id, nombre_rol, descripcion
FROM roles
WHERE nombre_rol IN ('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT')
ORDER BY id;
