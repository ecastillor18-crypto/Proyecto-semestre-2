# Sistema de Citas Médicas — Backend Spring Boot

Backend del proyecto semestral desarrollado con Java 21, Spring Boot, Spring Data JPA, MySQL y Spring Security con JWT.

## Repositorio

https://github.com/ecastillor18-crypto/Proyecto-semestre-2

## Requisitos para ejecutar el proyecto

- JDK 21.
- NetBeans con soporte para Gradle.
- MySQL Server 8 o superior.
- MySQL Workbench para ejecutar los scripts de forma gráfica.
- Postman para probar los servicios REST.
- Conexión a Internet la primera vez que Gradle descargue las dependencias.

## 1. Preparar MySQL

MySQL Workbench es la interfaz gráfica; el backend se conecta a MySQL Server.

Si la base de datos se va a crear desde cero, abrir MySQL Workbench, conectarse al servidor local y ejecutar:

```text
database/schema.sql
```

El script crea la base `citas_medicas`, sus tablas, relaciones, restricciones y datos base.

Si ya se utilizó la base de datos de Fase 1, no volver a ejecutar todo `schema.sql`. Ejecutar una sola vez:

```text
database/migrate_fase2.sql
```

Para comprobar la estructura de Fase 2 también está disponible:

```text
database/verify_fase2.sql
```

La conexión predeterminada del backend utiliza:

```text
Host: localhost
Puerto: 3306
Base: citas_medicas
Usuario: root
```

## 2. Configurar MySQL y JWT

El proyecto no guarda la contraseña real de MySQL ni la clave privada de JWT dentro del repositorio. Se proporcionan al backend mediante variables de entorno.

En PowerShell se pueden definir temporalmente así:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "TU_PASSWORD_MYSQL"
$env:JWT_SECRET = "MiClaveJWT_Fase2_2026_Segura_123456789"
$env:DEMO_DATA_ENABLED = "true"
```

Estas variables solo duran mientras esa sesión de PowerShell esté abierta.

Para guardarlas como variables de usuario de Windows:

```powershell
setx DB_USERNAME "root"
setx DB_PASSWORD "TU_PASSWORD_MYSQL"
setx JWT_SECRET "MiClaveJWT_Fase2_2026_Segura_123456789"
setx DEMO_DATA_ENABLED "true"
```

Después de utilizar `setx`, cerrar y volver a abrir NetBeans para que pueda leer las variables nuevas.

### Qué es `JWT_SECRET`

`JWT_SECRET` no es el token del ADMIN, DOCTOR o PATIENT. Es la clave privada que el backend utiliza para firmar y verificar los JWT que genera después de un login correcto.

El flujo es:

```text
Usuario + contraseña
        ↓
Spring Security valida las credenciales
        ↓
Se obtiene el rol del usuario
        ↓
El backend genera un JWT
        ↓
JWT_SECRET firma el JWT
        ↓
El cliente recibe el token
```

Los roles utilizados por el proyecto son:

```text
ROLE_ADMIN
ROLE_DOCTOR
ROLE_PATIENT
```

Spring Security utiliza esos roles para permitir o rechazar el acceso a los servicios protegidos.

## 3. Usuarios de prueba

Con `DEMO_DATA_ENABLED=true`, el backend prepara usuarios para realizar las pruebas locales:

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | `admin@citas.local` | `Admin123!` |
| DOCTOR | `doctor@citas.local` | `Doctor123!` |
| PATIENT | `paciente@citas.local` | `Paciente123!` |

## 4. Abrir y ejecutar en NetBeans

Abrir como proyecto la carpeta que contiene `build.gradle`.

Primero ejecutar:

```text
Clean and Build
```

También puede comprobarse desde PowerShell dentro de la carpeta del proyecto:

```powershell
.\gradlew.bat clean test
```

Para iniciar el backend:

```powershell
.\gradlew.bat bootRun
```

El servidor utiliza por defecto:

```text
http://localhost:8080
```

Swagger queda disponible en:

```text
http://localhost:8080/swagger-ui.html
```

## 5. Obtener un JWT

Con el backend y MySQL funcionando, realizar en Postman:

```http
POST http://localhost:8080/api/v1/auth/login
```

Ejemplo para ADMIN:

```json
{
  "email": "admin@citas.local",
  "password": "Admin123!"
}
```

Si las credenciales son correctas, el backend devuelve un JWT. Ese token se utiliza en las peticiones protegidas mediante:

```http
Authorization: Bearer <JWT>
```

Un token válido con el rol correcto permite el acceso. Sin token se espera `401 Unauthorized`; con un token válido pero sin el rol requerido se espera `403 Forbidden`.

## 6. Postman

Importar en Postman:

```text
postman_collection.json
```

La colección contiene los login de ADMIN, DOCTOR y PATIENT y guarda automáticamente los tokens en:

```text
adminToken
doctorToken
patientToken
```

Después las demás peticiones reutilizan esos tokens automáticamente.

La guía de ejecución de las pruebas está en:

```text
docs/FASE2_PRUEBAS_POSTMAN.md
```

## 7. Diagrama Entidad-Relación

El DER utilizado por el equipo está en:

```text
docs/DER_FASE1_EQUIPO.png
```

También se conserva la versión generada del diagrama:

```text
docs/DER_FASE1.png
```

---

# Fase 3 - Panel Web Angular

La Fase 3 completa se encuentra en:

```text
frontend/
```

Incluye:

- Login conectado a JWT.
- Interceptor `Authorization: Bearer <token>`.
- Guards por autenticación y rol.
- Lazy Loading de las funcionalidades.
- Panel ADMIN.
- CRUD de usuarios y roles.
- CRUD de médicos y especialidades.
- Gestión de horarios para ADMIN y DOCTOR.
- Vista de citas del doctor.
- Registro de diagnóstico y receta.

## Migración de base de datos

Si la base ya fue creada con Fase 2, ejecutar una sola vez:

```text
database/migrate_fase3.sql
```

Esta migración agrega:

```text
diagnostico
receta
```

a la tabla `citas_medicas`.

## Ejecutar Angular

Angular 22 requiere una versión de Node.js compatible. Comprobar primero:

```powershell
node --version
```

Luego:

```powershell
cd frontend
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

El backend continúa en:

```text
http://localhost:8080
```

## Documentación de Fase 3

Explicación completa del código y conexión Angular/Spring:

```text
docs/GUIA_FASE3_ANGULAR_SPRING.md
```

Checklist de pruebas:

```text
docs/FASE3_PRUEBAS.md
```
