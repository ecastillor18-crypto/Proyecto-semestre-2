USE citas_medicas;

SET @normal_horario_index = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'citas_medicas'
      AND INDEX_NAME = 'idx_citas_horario'
);

SET @create_index_sql = IF(
    @normal_horario_index = 0,
    'CREATE INDEX idx_citas_horario ON citas_medicas(horario_id)',
    'SELECT 1'
);

PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @unique_horario_index = (
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'citas_medicas'
      AND COLUMN_NAME = 'horario_id'
      AND NON_UNIQUE = 0
      AND INDEX_NAME <> 'PRIMARY'
    LIMIT 1
);

SET @drop_unique_sql = IF(
    @unique_horario_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE citas_medicas DROP INDEX `', @unique_horario_index, '`')
);

PREPARE stmt FROM @drop_unique_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
