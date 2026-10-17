# Pruebas de Fase 2 con Postman

## Antes de comenzar

Debe estar funcionando:

- Java 21.
- MySQL Server.
- La base `citas_medicas`.
- Spring Boot en `http://localhost:8080`.
- `DB_PASSWORD` configurada si el usuario de MySQL utiliza contraseña.
- `JWT_SECRET` configurada.
- `DEMO_DATA_ENABLED=true` para utilizar los usuarios de prueba.

Las instrucciones de MySQL, JWT y arranque están en `README.md`.

## 1. Importar la colección

En Postman seleccionar `Import` e importar:

```text
postman_collection.json
```

## 2. Ejecutar primero los login

Ejecutar la carpeta:

```text
1. Autenticación JWT
```

La colección inicia sesión con los usuarios de prueba y guarda automáticamente:

```text
adminToken
doctorToken
patientToken
```

No es necesario copiar los JWT manualmente. Las peticiones protegidas utilizan valores como:

```http
Authorization: Bearer {{doctorToken}}
```

## 3. Orden de las pruebas

Ejecutar las carpetas en este orden:

1. `1. Autenticación JWT`
2. `2. Consultas públicas`
3. `3. Motor de disponibilidad y cruces`
4. `4. Reserva y reglas de citas`
5. `5. Validaciones, seguridad y Swagger`

## 4. Resultados que se deben revisar

| Prueba | Resultado esperado |
|---|---|
| Login ADMIN correcto | `200` y JWT |
| Login DOCTOR correcto | `200` y JWT |
| Login PATIENT correcto | `200` y JWT |
| Contraseña incorrecta | `401` |
| Consulta pública de médicos | `200` |
| Consulta pública de horarios | `200` |
| DOCTOR crea horario válido | `201` |
| Crear horario que se cruza | `409` |
| PATIENT intenta crear horario | `403` |
| PATIENT reserva horario disponible | `201` |
| Intentar reservar el mismo horario otra vez | `409` |
| Consultar citas del paciente | `200` |
| Consultar citas del médico | `200` |
| Cancelar cita | `200` |
| Motivo vacío o request inválido | `400` |
| Ruta protegida sin JWT | `401` |
| Rol sin permiso para una operación | `403` |
| Swagger/OpenAPI disponible | `200` |

## 5. Qué capturas conviene guardar

Para demostrar que el backend está funcionando, guardar como mínimo capturas donde se vea la URL, método HTTP, respuesta y status de:

1. Login con `200` y JWT.
2. Creación de horario con `201`.
3. Horario cruzado rechazado con `409`.
4. Reserva de cita con `201`.
5. Doble reserva rechazada con `409`.
6. Una petición sin permiso con `403`.
7. Una petición sin JWT con `401`.
8. Una validación incorrecta con `400`.

## 6. Si el token expira

Los JWT tienen una duración limitada. Si después de un tiempo una petición protegida devuelve `401`, volver a ejecutar los login de la carpeta `1. Autenticación JWT`. La colección actualizará automáticamente `adminToken`, `doctorToken` y `patientToken`.
