# Sistema de Citas Médicas — Fase 1

Backend académico para un sistema de citas médicas. Esta entrega está limitada a **Fase 1: Diseño de Base de Datos y Estructura Backend**.

## Entregables de Fase 1 incluidos

1. **DER + script SQL**
   - `docs/DER_FASE1.png`
   - `docs/DER_FASE1.svg`
   - `docs/DER_FASE1.md` (fuente Mermaid y reglas de integridad)
   - `database/schema.sql` (script manual completo, crea la base)
   - `src/main/resources/schema.sql` (script usado por Spring Boot)
2. **Spring Boot + JPA + Spring Security + JWT**
   - Entidades JPA y repositorios.
   - Login `POST /api/v1/auth/login`.
   - Autenticación stateless con JWT HS256.
   - Roles `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_PATIENT`.
   - CORS explícito para Angular/Ionic.
3. **Colección Postman**
   - `postman_collection.json`.
   - Pruebas de login, JWT, 401, 403, médicos, horarios y Swagger.

También se incluye documentación de instalación, pruebas y auditoría de alcance.

## Tecnologías

- Java 21
- Spring Boot 4.1.0
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- OAuth2 Resource Server de Spring Security para validar JWT Bearer
- MySQL 8+
- Gradle Wrapper
- springdoc-openapi / Swagger UI
- Postman

## Estructura principal

```text
proyecto/
├── build.gradle
├── schema.sql                       # copia manual del entregable SQL
├── postman_collection.json          # colección oficial Fase 1
├── README.md
├── INSTALL.md
├── TESTING.md
├── database/
│   └── schema.sql                   # script SQL manual canónico
├── docs/
│   ├── DER_FASE1.md
│   ├── DER_FASE1.png
│   ├── DER_FASE1.svg
│   └── FASE1_AUDITORIA.md
└── src/main/
    ├── java/com/fase1/proyecto/
    │   ├── config/
    │   ├── controller/
    │   ├── dto/
    │   ├── exception/
    │   ├── modelos/
    │   ├── repository/
    │   ├── security/
    │   └── service/
    └── resources/
        ├── application.properties
        └── schema.sql
```

## Modelo de datos

Tablas de Fase 1:

- `roles`
- `usuarios`
- `especialidades`
- `medicos`
- `medico_especialidad`
- `horarios_disponibles`
- `citas_medicas`

El diseño separa catálogos, perfiles y relaciones N:M para mantener el modelo normalizado. Las reglas avanzadas de disponibilidad y prevención de cruces pertenecen a Fase 2 y no se implementan aquí.

## Endpoints oficiales de Fase 1

### Autenticación

```http
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "admin@citas.local",
  "password": "Admin123!"
}
```

Respuesta exitosa:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "userId": 1,
  "email": "admin@citas.local",
  "role": "ROLE_ADMIN"
}
```

### Médicos

```http
GET /api/v1/doctors
GET /api/v1/doctors?especialidadId=1
```

Rutas públicas durante Fase 1.

### Horarios disponibles

```http
GET /api/v1/schedules/available
GET /api/v1/schedules/available?medicoId=1
GET /api/v1/schedules/available?fecha=2026-08-25
GET /api/v1/schedules/available?medicoId=1&fecha=2026-08-25
```

Solo devuelve horarios con estado `DISPONIBLE`.

## Seguridad

La API utiliza sesiones **stateless**. El login valida email/contraseña mediante `DaoAuthenticationProvider` y `BCryptPasswordEncoder`, genera un JWT HS256 y el backend valida posteriormente `Authorization: Bearer <token>`.

El JWT contiene el `userId`, el email como `sub` y una lista `roles`. Los CRUD heredados bajo `/api/...` quedan restringidos a `ROLE_ADMIN`; los endpoints de consulta requeridos por Fase 1 se dejan públicos para facilitar búsqueda de médicos y disponibilidad.

El hash de contraseña nunca se serializa en las respuestas JSON de `Usuario`.

## CORS

Orígenes locales permitidos por defecto:

- `http://localhost:4200` — Angular
- `http://localhost:8100` — Ionic
- `capacitor://localhost` — Ionic/Capacitor

Se pueden reemplazar con la variable `CORS_ALLOWED_ORIGINS`.

## Datos demo

Para poder ejecutar Postman inmediatamente, en modo local se crean datos demo si no existen:

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@citas.local` | `Admin123!` |
| Doctor | `doctor@citas.local` | `Doctor123!` |
| Paciente | `paciente@citas.local` | `Paciente123!` |

También se crea un médico demo, una especialidad y dos horarios para el día siguiente.

Los datos demo pueden desactivarse:

```text
DEMO_DATA_ENABLED=false
```

## Swagger / OpenAPI

Con el backend levantado:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Inicio rápido

1. Crear una base MySQL vacía llamada `citas_medicas` o ejecutar `database/schema.sql`.
2. Configurar `DB_USERNAME` y `DB_PASSWORD`.
3. Definir una clave JWT propia para cualquier entorno que no sea solo demostración.
4. Ejecutar:

```bash
./gradlew bootRun
```

En Windows:

```bat
gradlew.bat bootRun
```

5. Importar `postman_collection.json` y ejecutar las carpetas en orden.

Consulta `INSTALL.md` para la instalación detallada y `TESTING.md` para el plan de pruebas.

## Variables de entorno

| Variable | Uso | Valor local por defecto |
|---|---|---|
| `DB_URL` | JDBC MySQL | `jdbc:mysql://localhost:3306/citas_medicas?...` |
| `DB_USERNAME` | usuario MySQL | `root` |
| `DB_PASSWORD` | contraseña MySQL | vacío si no se define |
| `JWT_SECRET` | clave HMAC JWT, mínimo 32 bytes | **obligatoria** |
| `JWT_EXPIRATION_MINUTES` | duración JWT | `120` |
| `CORS_ALLOWED_ORIGINS` | orígenes permitidos separados por coma | Angular/Ionic local |
| `DEMO_DATA_ENABLED` | crear datos demo | `true` |
| `SERVER_PORT` | puerto HTTP | `8080` |

## Fuera de alcance en esta entrega

No se implementan todavía:

- Motor transaccional para evitar cruces de horarios.
- DTOs/validaciones completas de todos los CRUD.
- Flujo completo de reserva de citas.
- Angular.
- Ionic.
- Notificación visual de pérdida de Internet.
- Registro de diagnóstico de la consulta.

Esos puntos corresponden a Fases 2–5 según el cronograma proporcionado.
