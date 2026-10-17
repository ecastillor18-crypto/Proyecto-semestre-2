# Guía completa de Fase 3: Angular + Spring Boot

Esta guía explica qué hace cada grupo de archivos de la Fase 3 y cómo se conecta Angular con Spring Boot.

---

# 1. La idea principal

El sistema queda dividido así:

```text
ANGULAR (frontend)
Pantallas, botones, formularios, rutas, Guards, Interceptor
        |
        | HTTP + JSON + JWT
        v
SPRING BOOT (backend)
Controllers, Services, Security, reglas de negocio
        |
        | JPA
        v
MYSQL
Usuarios, médicos, especialidades, horarios, citas
```

Angular NO entra directamente a MySQL. Angular siempre habla con un endpoint REST de Spring Boot.

Ejemplo:

```text
Usuario presiona Guardar en Angular
        ↓
UsuariosPageComponent
        ↓
UsuarioService de Angular
        ↓
POST /api/usuarios
        ↓
UsuarioController de Spring
        ↓
UsuarioService de Spring
        ↓
UsuarioRepository
        ↓
MySQL
```

---

# 2. Configuración principal de Angular

## `frontend/src/main.ts`

Es el punto donde arranca Angular.

```text
bootstrapApplication(AppComponent, appConfig)
```

Le dice al navegador: crea la aplicación usando `AppComponent` y la configuración declarada en `app.config.ts`.

No llama directamente a Spring.

## `frontend/src/app/app.component.ts`

Contiene el `router-outlet` principal. Ese espacio se reemplaza por Login o por el panel dependiendo de la URL.

## `frontend/src/app/app.config.ts`

Aquí se registran dos piezas fundamentales:

- Router de Angular.
- HttpClient con Interceptors.

```text
provideRouter(routes)
provideHttpClient(withInterceptors([...]))
```

Gracias a `provideHttpClient`, los Services de Angular pueden hacer GET, POST, PUT, PATCH y DELETE a Spring Boot.

## `frontend/src/environments/environment.ts`

Contiene:

```text
apiUrl = http://localhost:8080
```

Todos los Services reutilizan esa dirección. Si luego el backend cambia de servidor, este es uno de los lugares principales que se cambia.

---

# 3. Rutas y Lazy Loading

## `frontend/src/app/app.routes.ts`

Este archivo decide qué componente se abre para cada URL.

Ejemplos:

```text
/login            -> Login
/usuarios         -> Usuarios
/roles            -> Roles
/medicos          -> Médicos
/especialidades   -> Especialidades
/horarios         -> Horarios
/consultas        -> Citas del doctor
```

Las funciones `loadChildren()` y `loadComponent()` implementan carga perezosa.

Ejemplo:

```text
loadChildren: () => import('./features/usuarios/usuarios.routes')
```

Eso significa que Angular no carga el código de Usuarios hasta que realmente se necesita.

Los Guards se ejecutan antes de abrir las rutas.

---

# 4. Login y JWT

## Angular: `features/auth/login.component.ts`

Este componente contiene el formulario de:

- email
- contraseña

Al presionar Ingresar ejecuta:

```text
auth.login(...)
```

Ese método está en `AuthService`.

## Angular: `core/services/auth.service.ts`

El método principal es conceptualmente:

```text
POST /api/v1/auth/login
```

Angular manda:

```json
{
  "email": "admin@citas.local",
  "password": "Admin123!"
}
```

## Spring: `AuthController.java`

Recibe exactamente esa petición:

```text
POST /api/v1/auth/login
```

Spring Security comprueba usuario y contraseña y `JwtService` genera el token.

Spring responde algo similar a:

```json
{
  "token": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "userId": 1,
  "email": "admin@citas.local",
  "role": "ROLE_ADMIN"
}
```

## De regreso en Angular

`AuthService` guarda la sesión en `localStorage`.

Esto permite conservar temporalmente:

- JWT
- usuario
- rol
- hora de expiración

`BehaviorSubject` mantiene el estado actual de sesión y permite que otras partes de la interfaz sepan quién está conectado.

---

# 5. Interceptor HTTP

## `core/interceptors/auth.interceptor.ts`

Su trabajo es evitar escribir el token manualmente en cada Service.

Sin Interceptor tendríamos que hacer esto en cada petición:

```text
Authorization: Bearer TOKEN
```

Con el Interceptor, Angular lo añade automáticamente.

Flujo:

```text
UsuarioService.get()
        ↓
authInterceptor
        ↓
agrega Authorization
        ↓
Spring Security
        ↓
valida JWT
```

## `core/interceptors/api-error.interceptor.ts`

Si Spring devuelve `401 Unauthorized`, Angular elimina la sesión y regresa al login.

---

# 6. Guards

## `core/guards/auth.guard.ts`

Comprueba si existe una sesión válida.

Sin sesión:

```text
/usuarios -> /login
```

## `core/guards/role.guard.ts`

Comprueba el rol antes de abrir una pantalla.

Ejemplo:

```text
/usuarios -> ROLE_ADMIN
/medicos -> ROLE_ADMIN
/consultas -> ROLE_DOCTOR
/horarios -> ROLE_ADMIN o ROLE_DOCTOR
```

Esto protege la VISTA.

Pero la seguridad real también existe en Spring Boot.

## Spring: `SecurityConfig.java`

Ejemplo:

```text
/api/usuarios/** -> ROLE_ADMIN
/api/v1/appointments/doctor -> ROLE_DOCTOR
/api/v1/schedules/** -> ADMIN o DOCTOR según operación
```

Por eso existen dos barreras:

```text
Angular Guard = no enseña la pantalla incorrecta
Spring Security = no permite ejecutar la API incorrecta
```

Aunque alguien intente saltarse Angular con Postman, Spring sigue validando el JWT y el rol.

---

# 7. Menú principal

## `layout/shell.component.ts`

Contiene:

- menú lateral
- correo de la sesión
- rol
- botón Cerrar sesión
- `router-outlet`

Muestra opciones distintas dependiendo del rol.

ADMIN ve:

```text
Resumen
Usuarios
Roles
Médicos
Especialidades
Horarios
```

DOCTOR ve:

```text
Horarios
Mis citas
```

---

# 8. Usuarios

## Angular: `features/usuarios/usuarios-page.component.ts`

Hace cuatro operaciones:

```text
listar
crear
editar
eliminar
```

El formulario es Reactive Form.

Campos:

```text
nombre
apellido
email
password
telefono
rolId
activo
```

## Angular: `core/services/usuario.service.ts`

Traduce los botones de la vista a HTTP:

```text
listar    -> GET    /api/usuarios
crear     -> POST   /api/usuarios
editar    -> PUT    /api/usuarios/{id}
eliminar  -> DELETE /api/usuarios/{id}
```

## Spring: `UsuarioController.java`

Recibe las peticiones anteriores.

El Controller no debe contener toda la lógica. Pasa la información a `UsuarioService.java`.

## Spring: `UsuarioService.java`

Aquí ocurre la lógica real.

Al crear un usuario:

1. Comprueba que el email no esté repetido.
2. Comprueba que la contraseña tenga al menos 8 caracteres.
3. Busca el rol indicado por `rolId`.
4. Convierte la contraseña a BCrypt.
5. Guarda el usuario.

Esto es muy importante:

```text
Angular manda: Admin123!
Spring guarda: $2a$10$......
```

Angular nunca debe generar el hash BCrypt.

## `UsuarioAdminRequest.java`

Define el JSON que Spring espera recibir.

## `UsuarioResponseDTO.java`

Define lo que Spring devuelve a Angular.

No devuelve `passwordHash`.

---

# 9. Roles

## Angular: `features/roles/roles-page.component.ts`

Permite listar, crear, editar y eliminar roles.

## Angular: `RolService`

```text
GET    /api/roles
POST   /api/roles
PUT    /api/roles/{id}
DELETE /api/roles/{id}
```

## Spring

Esas rutas llegan a `RolController.java` y luego a `RolService.java`.

Los nombres centrales:

```text
ROLE_ADMIN
ROLE_DOCTOR
ROLE_PATIENT
```

no deberían renombrarse porque `SecurityConfig` depende de ellos.

---

# 10. Médicos

## Angular: `features/medicos/medicos-page.component.ts`

Un médico está dividido en dos conceptos:

```text
Usuario
  nombre
  email
  contraseña
  ROLE_DOCTOR

Perfil médico
  número colegiado
  años experiencia
  biografía
  especialidades
```

Por eso primero se crea un Usuario con `ROLE_DOCTOR` y después se crea el perfil de Médico.

El formulario de médico permite elegir únicamente usuarios con ROLE_DOCTOR.

## Angular: `MedicoService`

Administración:

```text
GET    /api/medicos
POST   /api/medicos
PUT    /api/medicos/{id}
DELETE /api/medicos/{id}
```

También existen endpoints públicos/propios:

```text
GET /api/v1/doctors
GET /api/v1/doctors/me
```

## Spring: `MedicoController.java`

Maneja el CRUD administrativo.

## Spring: `MedicoService.java`

Valida que:

- el usuario exista
- tenga ROLE_DOCTOR
- no esté utilizado por otro perfil médico
- las especialidades existan

## DTOs

`MedicoAdminRequest` recibe desde Angular:

```json
{
  "usuarioId": 2,
  "numeroColegiado": "COL-001",
  "aniosExperiencia": 5,
  "biografia": "...",
  "especialidadIds": [1, 3]
}
```

`MedicoAdminResponse` devuelve una estructura más cómoda para Angular.

---

# 11. Especialidades

## Angular

`EspecialidadesPageComponent` + `EspecialidadService`.

## HTTP

```text
GET    /api/especialidades
POST   /api/especialidades
PUT    /api/especialidades/{id}
DELETE /api/especialidades/{id}
```

## Spring

`EspecialidadController` -> `EspecialidadService` -> `EspecialidadRepository` -> MySQL.

---

# 12. Horarios y agenda

## Angular: `features/horarios/horarios-page.component.ts`

Esta misma pantalla funciona para ADMIN y DOCTOR.

ADMIN:

- puede seleccionar cualquier médico
- puede crear horarios para cualquier médico

DOCTOR:

- `GET /api/v1/doctors/me` obtiene su perfil
- Angular fija su propio `medicoId`
- no necesita escoger quién es

## Angular: `HorarioService`

```text
GET   /api/v1/schedules/manage
POST  /api/v1/schedules
PUT   /api/v1/schedules/{id}
PATCH /api/v1/schedules/{id}/cancel
```

## Spring: `ScheduleController.java`

Recibe esas peticiones.

## Spring: `HorarioService.java`

Aquí están las reglas importantes:

- fecha no puede estar en el pasado
- hora inicio debe ser menor que hora fin
- no debe cruzarse con otro bloque activo
- un doctor solo administra sus propios horarios
- ADMIN puede administrar cualquier médico
- un bloque RESERVADO no puede modificarse directamente

La validación Angular mejora la experiencia, pero Spring vuelve a validarlo porque no se puede confiar en el navegador.

Ejemplo:

```text
Angular comprueba 08:00 < 09:00
        ↓
manda POST
        ↓
Spring vuelve a comprobar 08:00 < 09:00
        ↓
Spring revisa cruces en MySQL
        ↓
guarda
```

---

# 13. Citas del doctor

## Angular: `features/consultas/consultas-page.component.ts`

El doctor elige una fecha y Angular llama:

```text
GET /api/v1/appointments/doctor?fecha=2026-09-29
```

La respuesta muestra:

- hora
- paciente
- motivo
- estado

Angular NO manda el id del doctor para consultar su agenda.

## ¿Cómo sabe Spring qué doctor es?

El Interceptor manda el JWT.

El JWT contiene `userId`.

`AppointmentController` obtiene:

```text
@AuthenticationPrincipal Jwt jwt
```

Luego `CitaService.listarDoctor(...)` busca el perfil médico asociado a ese usuario.

Eso evita que un doctor cambie manualmente un `doctorId` y vea la agenda de otro.

---

# 14. Diagnóstico y receta

Esta parte faltaba en la Fase 2 original y se añadió para cumplir el requisito de Fase 3.

## Base de datos

Se agregaron a `citas_medicas`:

```text
diagnostico TEXT
receta TEXT
```

Si ya existe la base de Fase 2 se debe ejecutar una sola vez:

```text
database/migrate_fase3.sql
```

## Spring: `Cita.java`

Ahora tiene:

```text
diagnostico
receta
```

## Spring: `DiagnosticoRequest.java`

Recibe:

```json
{
  "diagnostico": "Infección respiratoria...",
  "receta": "Medicamento..."
}
```

## Spring: `AppointmentController.java`

Nuevo endpoint:

```text
PUT /api/v1/appointments/{id}/diagnosis
```

## Spring: `CitaService.registrarDiagnostico()`

Comprueba:

1. que la cita exista
2. que el doctor autenticado sea el doctor de esa cita
3. que no esté cancelada
4. que la hora de la cita ya haya iniciado
5. guarda diagnóstico
6. guarda receta
7. cambia estado a COMPLETADA

## Angular: `CitaService`

La pantalla llama ese endpoint cuando el médico presiona Finalizar consulta.

---

# 15. Modelos TypeScript

Los archivos dentro de:

```text
core/models/
```

no guardan datos en MySQL.

Son interfaces que le dicen a TypeScript qué estructura de JSON espera Angular.

Ejemplo:

```text
UsuarioResponseDTO.java en Spring
          ↕ JSON
usuario.model.ts en Angular
```

Deben coincidir los nombres importantes.

Ejemplo:

```text
Spring: pacienteNombre
Angular: pacienteNombre
```

Si Spring devuelve `pacienteNombre` pero Angular intenta leer `nombrePaciente`, aparecerá `undefined`.

---

# 16. Manejo de errores

## Spring

`GlobalExceptionHandler.java` convierte errores a respuestas HTTP claras:

```text
400 -> validación
401 -> no autenticado
403 -> sin permisos
404 -> recurso no existe
409 -> regla de negocio
500 -> error inesperado
```

## Angular

`api-error.util.ts` lee esa respuesta y extrae el mensaje para mostrarlo en la vista.

Así una regla de Spring como:

```text
El horario se cruza con otro horario activo del médico
```

puede aparecer directamente en el formulario Angular.

---

# 17. Relación exacta Angular -> Spring

| Vista Angular | Service Angular | Endpoint | Controller Spring | Service Spring |
|---|---|---|---|---|
| Login | AuthService | POST `/api/v1/auth/login` | AuthController | AuthenticationManager + JwtService |
| Usuarios | UsuarioService | `/api/usuarios` | UsuarioController | UsuarioService |
| Roles | RolService | `/api/roles` | RolController | RolService |
| Médicos | MedicoService | `/api/medicos` | MedicoController | MedicoService |
| Especialidades | EspecialidadService | `/api/especialidades` | EspecialidadController | EspecialidadService |
| Horarios | HorarioService | `/api/v1/schedules/...` | ScheduleController | HorarioService |
| Mis citas | CitaService | GET `/api/v1/appointments/doctor` | AppointmentController | CitaService |
| Diagnóstico | CitaService | PUT `/api/v1/appointments/{id}/diagnosis` | AppointmentController | CitaService |

---

# 18. Qué archivos pertenecen a cada persona

## Persona 1 - Login y seguridad

Angular:

```text
features/auth/
core/services/auth.service.ts
core/guards/
core/interceptors/
layout/
app.routes.ts
```

Spring relacionado:

```text
AuthController.java          (ya existía)
JwtService.java              (ya existía)
SecurityConfig.java          (existía; se agregaron rutas nuevas)
```

## Persona 2 - Usuarios y roles

Angular:

```text
features/usuarios/
features/roles/
core/services/usuario.service.ts
core/services/rol.service.ts
```

Spring:

```text
UsuarioController.java
UsuarioService.java
UsuarioAdminRequest.java
UsuarioResponseDTO.java
RolController.java           (ya existía)
RolService.java              (ya existía)
```

## Persona 3 - Médicos y especialidades

Angular:

```text
features/medicos/
features/especialidades/
MedicoService
EspecialidadService
```

Spring:

```text
MedicoController.java
MedicoService.java
MedicoAdminRequest.java
MedicoAdminResponse.java
EspecialidadController.java  (ya existía)
EspecialidadService.java     (ya existía)
DoctorController.java
```

## Persona 4 - Horarios

Angular:

```text
features/horarios/
HorarioService
```

Spring:

```text
ScheduleController.java
HorarioService.java
HorarioRepository.java
```

## Persona 5 - Consulta médica

Angular:

```text
features/consultas/
CitaService
```

Spring:

```text
AppointmentController.java
CitaService.java
Cita.java
CitaResponseDTO.java
DiagnosticoRequest.java
migrate_fase3.sql
```

---

# 19. Cómo ejecutar todo

## Paso 1 - MySQL

Si la base es la de Fase 2, ejecutar:

```text
database/migrate_fase3.sql
```

Solo una vez.

## Paso 2 - Variables del backend

PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "TU_PASSWORD"
$env:JWT_SECRET = "MiClaveJWT_Fase3_2026_Segura_123456789"
$env:DEMO_DATA_ENABLED = "true"
```

## Paso 3 - Spring Boot

Desde la raíz:

```powershell
.\gradlew.bat clean test
.\gradlew.bat bootRun
```

Debe quedar en:

```text
http://localhost:8080
```

## Paso 4 - Angular

En otra terminal:

```powershell
cd frontend
npm install
npm start
```

Debe quedar en:

```text
http://localhost:4200
```

---

# 20. Orden recomendado para probar

1. Login ADMIN.
2. Crear/editar un usuario.
3. Crear usuario ROLE_DOCTOR.
4. Crear especialidad.
5. Crear perfil de médico.
6. Crear horario.
7. Ingresar como DOCTOR.
8. Comprobar que solo ve Horarios y Mis citas.
9. Crear/consultar su horario.
10. Tener una cita asociada y registrar diagnóstico.

---

# 21. Regla para entender cualquier archivo

Cuando te pierdas, hazte estas preguntas:

```text
¿Esto se ve en pantalla?
Sí -> Angular Component / HTML

¿Esto manda HTTP?
Sí -> Angular Service

¿Esto decide si puedo abrir una página?
Sí -> Angular Guard

¿Esto añade JWT?
Sí -> Angular Interceptor

¿Esto recibe una URL /api/...?
Sí -> Spring Controller

¿Esto aplica reglas de negocio?
Sí -> Spring Service

¿Esto consulta o guarda entidades?
Sí -> Spring Repository

¿Esto persiste para siempre?
Sí -> MySQL
```

Con esa regla puedes seguir casi todo el proyecto sin memorizar cada archivo.
