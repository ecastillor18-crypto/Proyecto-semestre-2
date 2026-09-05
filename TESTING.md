# Reporte y guía de pruebas — Fase 1

## Objetivo

Validar los tres entregables funcionales de Fase 1: inicialización del backend/BD, autenticación JWT y endpoints REST básicos.

## Colección oficial

```text
postman_collection.json
```

Variable principal:

```text
baseUrl = http://localhost:8080
```

La colección usa los usuarios demo creados por el backend cuando `DEMO_DATA_ENABLED=true`.

## Matriz de pruebas

| ID | Prueba | Resultado esperado |
|---|---|---|
| AUTH-01 | Login ADMIN correcto | `200` + JWT + `ROLE_ADMIN` |
| AUTH-02 | Login DOCTOR correcto | `200` + JWT + `ROLE_DOCTOR` |
| AUTH-03 | Login con contraseña incorrecta | `401` |
| DOC-01 | `GET /api/v1/doctors` | `200` + arreglo JSON |
| DOC-02 | Filtrar médicos por `especialidadId` | `200` + arreglo JSON |
| SCH-01 | `GET /api/v1/schedules/available` | `200`; solo estado `DISPONIBLE` |
| SCH-02 | Filtrar horarios por `medicoId` y `fecha` | `200`; resultados coinciden con filtros |
| SCH-03 | Fecha con formato inválido | `400` |
| SEC-01 | ADMIN consulta `/api/usuarios` con JWT | `200` |
| SEC-02 | DOCTOR consulta ruta exclusiva ADMIN | `403` |
| SEC-03 | Acceso a ruta protegida sin JWT | `401` |
| DOCS-01 | `GET /v3/api-docs` | `200` |

## Ejecución recomendada

1. Crear/inicializar MySQL con `database/schema.sql`.
2. Levantar el backend.
3. Importar `postman_collection.json`.
4. Ejecutar las carpetas en el orden numérico.
5. Confirmar que no existan tests rojos.

## Qué automatiza la colección

- Guarda el JWT de administrador en `adminToken`.
- Guarda el JWT de médico en `doctorToken`.
- Obtiene un `doctorId` real desde `/api/v1/doctors`.
- Obtiene una `especialidadId` real desde el mismo resultado.
- Obtiene una fecha real desde `/api/v1/schedules/available`.
- Reutiliza esos valores para las pruebas filtradas.

## Validaciones manuales adicionales

### JWT

El token debe incluir:

- `sub`: email del usuario.
- `userId`: identificador del usuario.
- `roles`: rol del usuario.
- `iss`: `sistema-citas-medicas`.
- `iat` y `exp`.

### CORS

Probar una petición desde los orígenes configurados y confirmar que el backend devuelve los encabezados CORS apropiados.

### Base de datos

Verificar:

```sql
SHOW TABLES;
SELECT * FROM roles;
SELECT * FROM especialidades;
SELECT id, nombre, apellido, email, rol_id, activo FROM usuarios;
```

No consultar ni publicar hashes de contraseña salvo que sea necesario para una revisión técnica local.

## Estado de verificación de esta revisión

Se realizó revisión estática de estructura, rutas, dependencias, SQL, colección JSON y consistencia entre documentación/código. La colección Postman es JSON válido y el DER se generó desde la definición del esquema.

En el entorno usado para preparar esta corrección no fue posible completar `./gradlew clean test` porque el Gradle Wrapper necesitaba descargar su distribución desde `services.gradle.org` y el entorno de ejecución no tenía resolución de red. Por ello, la comprobación final de compilación + conexión MySQL debe ejecutarse en una máquina con acceso a dependencias Maven/Gradle y MySQL disponible. Este límite no se presenta como una prueba aprobada.
