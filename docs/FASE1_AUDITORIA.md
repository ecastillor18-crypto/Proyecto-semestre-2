# Auditoría de cumplimiento — Fase 1

## Alcance evaluado

Fase 1: **Diseño de Base de Datos y Estructura Backend**.

No se evaluaron ni implementaron requisitos propios de Fase 2, Angular, Ionic o la demo final.

## Resultado por entregable

| Requisito Fase 1 | Estado tras revisión | Evidencia |
|---|---|---|
| DER | COMPLETO | `docs/DER_FASE1.png`, `.svg`, `.md` |
| `schema.sql` con PK/FK/constraints | COMPLETO | `database/schema.sql` y `src/main/resources/schema.sql` |
| Modelo 3FN | COMPLETO para el alcance definido | separación roles, usuarios, especialidades, médicos y N:M |
| Modelos JPA | COMPLETO | `modelos/` |
| Repositorios `JpaRepository` | COMPLETO | `repository/` |
| Conexión MySQL | COMPLETO | `application.properties` parametrizado |
| Spring Security | COMPLETO | `config/SecurityConfig.java` |
| JWT stateless | COMPLETO | `security/JwtService.java` + Resource Server |
| Roles ADMIN/DOCTOR/PATIENT | COMPLETO | BD + JWT + autorización |
| `POST /api/v1/auth/login` | COMPLETO | `AuthController.java` |
| CORS Angular/Ionic | COMPLETO | `SecurityConfig.java` + propiedades |
| `GET /api/v1/doctors` | COMPLETO | filtro opcional por `especialidadId` |
| `GET /api/v1/schedules/available` | COMPLETO | filtro por médico y fecha |
| `@ControllerAdvice` | COMPLETO | `GlobalExceptionHandler.java` |
| Colección Postman | COMPLETO | `postman_collection.json` |
| README / instalación | COMPLETO | `README.md`, `INSTALL.md` |
| Swagger | COMPLETO | springdoc + `/swagger-ui.html` y `/v3/api-docs` |
| Reporte de pruebas | COMPLETO como plan verificable | `TESTING.md` |

## Problemas detectados en la versión recibida y corregidos

1. No existían dependencias ni configuración de Spring Security/JWT.
2. No existía `POST /api/v1/auth/login`.
3. `UsuarioRepository` no permitía buscar por email para autenticar.
4. Los roles no estaban conectados a un mecanismo real de autorización.
5. CORS no estaba configurado.
6. La colección Postman principal probaba rutas distintas al backend (`/api/auth/login` y `/api/personas`).
7. Faltaba Swagger/OpenAPI pese a estar pedido en los entregables de documentación.
8. Faltaba un DER entregable dentro del proyecto.
9. El README describía solo la parte de JPA y no reflejaba el estado integral de Fase 1.
10. El proyecto incluía `ROLE_SECRETARY`, aunque el alcance proporcionado define únicamente ADMIN, DOCTOR y PATIENT.
11. Existía una entidad `RegistroClinico` fuera del alcance de Fase 1 y sin la capa completa asociada; se retiró para dejar esta entrega alineada al hito.
12. El hash de contraseña podía exponerse al serializar `Usuario`; ahora es de solo escritura JSON.

## Decisiones de alcance

- Los endpoints CRUD antiguos bajo `/api/...` se conservaron para no destruir trabajo existente, pero se protegieron con `ROLE_ADMIN`.
- Los endpoints oficiales exigidos por Fase 1 usan prefijo `/api/v1`.
- Las validaciones de negocio para cruces de citas no se adelantaron porque están explícitamente asignadas a Fase 2.
- No se agregó Angular, Ionic ni notificación visual de red porque pertenecen a fases posteriores.

## Pendiente antes de entregar en clase

Ejecutar localmente:

```text
gradlew.bat clean build
gradlew.bat bootRun
```

Con MySQL activo, ejecutar toda la colección `postman_collection.json` y guardar capturas o exportar el resultado del Collection Runner si el profesor solicita evidencia visual.
