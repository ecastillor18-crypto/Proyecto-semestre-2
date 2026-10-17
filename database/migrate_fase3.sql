USE citas_medicas;

-- Ejecutar UNA sola vez si la base ya viene de Fase 2.
ALTER TABLE citas_medicas
    ADD COLUMN diagnostico TEXT NULL AFTER motivo,
    ADD COLUMN receta TEXT NULL AFTER diagnostico;
