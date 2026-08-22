# Sistema de Citas Médicas

Proyecto de un sistema de citas médicas desarrollado con Spring Boot, Java, JPA, Hibernate y MySQL.

## Tecnologías

- Java 21
- Spring Boot 4.1.0
- Spring Data JPA
- Hibernate
- MySQL 8
- Gradle
- Thymeleaf

## Base de datos

El proyecto utiliza una base de datos MySQL llamada:

`citas_medicas`

El archivo `src/main/resources/schema.sql` contiene la estructura de la base de datos, relaciones, restricciones y datos iniciales.

## Tablas

La base de datos contiene las siguientes tablas:

- `roles`
- `usuarios`
- `especialidades`
- `medicos`
- `medico_especialidad`
- `horarios_disponibles`
- `citas_medicas`

## Configuración de MySQL

### 1. Instalar MySQL

Instalar:

- MySQL Server 8
- MySQL Workbench

### 2. Crear la base de datos

Abrir MySQL Workbench y conectarse al servidor MySQL.

Crear primero la base de datos vacía:

```sql
CREATE DATABASE citas_medicas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Después, ejecutar el archivo:

`src/main/resources/schema.sql`

Ejecutar todo el script.

El archivo creará las tablas, relaciones y datos iniciales de roles y especialidades.

## Datos iniciales

El script incluye los siguientes roles:

- `ROLE_ADMIN`
- `ROLE_DOCTOR`
- `ROLE_PATIENT`
- `ROLE_SECRETARY`

También incluye las siguientes especialidades:

- `Medicina General`
- `Pediatría`
- `Cardiología`

## Configuración de Spring Boot

Abrir:

`src/main/resources/application.properties`

Configurar las credenciales de MySQL.

Ejemplo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/citas_medicas?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Cada integrante debe colocar sus propias credenciales de MySQL.

En PowerShell, antes de ejecutar la aplicación, definir la contraseña sin escribirla en el repositorio:

```powershell
$env:DB_PASSWORD = "TU_CONTRASEÑA"
```

No subir contraseñas personales al repositorio.

## Modelos JPA

Los modelos JPA representan las tablas principales de la base de datos:

- `Rol` → `roles`
- `Usuario` → `usuarios`
- `Medico` → `medicos`
- `Especialidad` → `especialidades`
- `Horario` → `horarios_disponibles`
- `Cita` → `citas_medicas`

## Relaciones

### Usuario - Rol

Un usuario pertenece a un rol.

```text
Usuario → Rol
```

### Médico - Usuario

Un médico está relacionado con un usuario.

```text
Medico → Usuario
```

### Médico - Especialidad

Un médico puede tener varias especialidades y una especialidad puede pertenecer a varios médicos.

```text
Medico ↔ Especialidad
```

La relación utiliza la tabla:

`medico_especialidad`

### Horario - Médico

Un horario pertenece a un médico.

```text
Horario → Medico
```

### Cita - Paciente

Una cita pertenece a un usuario que actúa como paciente.

```text
Cita → Usuario
```

### Cita - Médico

Una cita pertenece a un médico.

```text
Cita → Medico
```

### Cita - Horario

Una cita utiliza un horario disponible.

```text
Cita → Horario
```

## Repositorios

El proyecto utiliza Spring Data JPA mediante los siguientes repositorios:

- `RolRepository`
- `UsuarioRepository`
- `MedicoRepository`
- `EspecialidadRepository`
- `HorarioRepository`
- `CitaRepository`

Todos utilizan `JpaRepository`.

## Estructura del proyecto

```text
proyecto/
│
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── README.md
│
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── fase1/
        │           └── proyecto/
        │               ├── modelos/
        │               │   ├── Rol.java
        │               │   ├── Usuario.java
        │               │   ├── Medico.java
        │               │   ├── Especialidad.java
        │               │   ├── Horario.java
        │               │   └── Cita.java
        │               │
        │               ├── repository/
        │               │   ├── RolRepository.java
        │               │   ├── UsuarioRepository.java
        │               │   ├── MedicoRepository.java
        │               │   ├── EspecialidadRepository.java
        │               │   ├── HorarioRepository.java
        │               │   └── CitaRepository.java
        │               │
        │               └── ...
        │
        └── resources/
            ├── application.properties
            └── schema.sql
```

## Ejecutar el proyecto

### Desde NetBeans

1. Abrir el proyecto.
2. Verificar que MySQL esté ejecutándose.
3. Verificar las credenciales en `application.properties`.
4. Ejecutar `Clean and Build`.
5. Ejecutar el proyecto.

### Desde Windows

Abrir una terminal en la carpeta del proyecto y ejecutar:

```text
gradlew.bat bootRun
```

La aplicación se ejecutará normalmente en:

`http://localhost:8080`

## Verificación

Al iniciar el proyecto se debe comprobar en la consola que:

- Spring Boot inicia correctamente.
- Hibernate se inicializa correctamente.
- Los repositorios JPA son detectados.
- Se establece la conexión con MySQL.
- La aplicación inicia en el puerto 8080.

## Parte de Persona 2

La Persona 2 se encargó de:

- Modelos JPA.
- Relaciones entre entidades.
- Repositorios JPA.
- Configuración de conexión con MySQL.
- Verificación de la conexión entre Spring Boot, Hibernate y MySQL.
