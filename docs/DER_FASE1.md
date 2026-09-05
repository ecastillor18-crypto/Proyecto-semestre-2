# DER — Sistema de Citas Médicas (Fase 1)

El modelo cubre únicamente las entidades requeridas para la Fase 1: usuarios/roles, especialidades/médicos, horarios disponibles y citas médicas. La relación médico–especialidad es N:M y se normaliza mediante `medico_especialidad`.

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : asigna
    USUARIOS ||--o| MEDICOS : perfil_medico
    MEDICOS ||--o{ MEDICO_ESPECIALIDAD : posee
    ESPECIALIDADES ||--o{ MEDICO_ESPECIALIDAD : clasifica
    MEDICOS ||--o{ HORARIOS_DISPONIBLES : publica
    USUARIOS ||--o{ CITAS_MEDICAS : paciente
    MEDICOS ||--o{ CITAS_MEDICAS : atiende
    HORARIOS_DISPONIBLES ||--o| CITAS_MEDICAS : reserva

    ROLES {
        INT id PK
        VARCHAR nombre_rol UK
        VARCHAR descripcion
    }

    USUARIOS {
        INT id PK
        VARCHAR nombre
        VARCHAR apellido
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR telefono
        INT rol_id FK
        BOOLEAN activo
        DATETIME fecha_creacion
    }

    ESPECIALIDADES {
        INT id PK
        VARCHAR nombre UK
        VARCHAR descripcion
    }

    MEDICOS {
        INT id PK
        INT usuario_id FK,UK
        VARCHAR numero_colegiado UK
        INT anios_experiencia
        TEXT biografia
    }

    MEDICO_ESPECIALIDAD {
        INT medico_id PK,FK
        INT especialidad_id PK,FK
    }

    HORARIOS_DISPONIBLES {
        INT id PK
        INT medico_id FK
        DATE fecha
        TIME hora_inicio
        TIME hora_fin
        ENUM estado
    }

    CITAS_MEDICAS {
        INT id PK
        INT paciente_id FK
        INT medico_id FK
        INT horario_id FK,UK
        ENUM estado
        VARCHAR motivo
        DATETIME fecha_creacion
        DATETIME fecha_actualizacion
    }
```

## Reglas de integridad principales

- `usuarios.email` es único y se utiliza como identificador de login.
- `medicos.usuario_id` es único, por lo que un usuario solo puede tener un perfil de médico.
- `medico_especialidad` resuelve la relación N:M sin atributos redundantes.
- `horarios_disponibles` evita duplicar el mismo inicio de bloque para un médico en una fecha.
- `hora_fin > hora_inicio` se valida con `CHECK`.
- `citas_medicas.horario_id` es único, impidiendo reservar dos citas sobre el mismo bloque.
- Los cruces de horarios más complejos y las reglas transaccionales se dejan para Fase 2, como indica el cronograma.
