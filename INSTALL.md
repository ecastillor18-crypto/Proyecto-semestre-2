# Guía de instalación y despliegue local — Fase 1

## 1. Requisitos

- JDK 21.
- MySQL Server 8 o superior.
- Git (opcional, para clonar el repositorio).
- Postman para ejecutar la colección de pruebas.
- Gradle no necesita instalarse globalmente: el proyecto incluye Gradle Wrapper.

## 2. Crear la base de datos

Opción recomendada: ejecutar en MySQL Workbench el archivo:

```text
database/schema.sql
```

Ese script crea `citas_medicas`, selecciona la base y crea todas las tablas, índices, claves y catálogos de Fase 1.

Si solo se crea la base vacía manualmente, Spring Boot ejecutará `src/main/resources/schema.sql` al iniciar:

```sql
CREATE DATABASE citas_medicas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## 3. Configurar variables de entorno

### PowerShell (Windows)

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "TU_PASSWORD_MYSQL"
$env:JWT_SECRET = "una-clave-local-de-al-menos-32-bytes-y-no-publica"
```

Opcional:

```powershell
$env:DEMO_DATA_ENABLED = "true"
$env:SERVER_PORT = "8080"
```

### Bash (Linux/macOS)

```bash
export DB_USERNAME=root
export DB_PASSWORD='TU_PASSWORD_MYSQL'
export JWT_SECRET='una-clave-local-de-al-menos-32-bytes-y-no-publica'
```

No se debe subir una contraseña real ni una clave JWT real al repositorio.

## 4. Compilar

Windows:

```bat
gradlew.bat clean build
```

Linux/macOS:

```bash
chmod +x gradlew
./gradlew clean build
```

## 5. Ejecutar

Windows:

```bat
gradlew.bat bootRun
```

Linux/macOS:

```bash
./gradlew bootRun
```

Backend esperado:

```text
http://localhost:8080
```

## 6. Verificar Swagger

Abrir:

```text
http://localhost:8080/swagger-ui.html
```

El JSON OpenAPI está en:

```text
http://localhost:8080/v3/api-docs
```

## 7. Ejecutar Postman

Importar `postman_collection.json` y ejecutar en este orden:

1. `1. Autenticación JWT`.
2. `2. Endpoints públicos Fase 1`.
3. `3. Seguridad y roles`.
4. `4. Documentación Swagger`.

La colección guarda automáticamente `adminToken`, `doctorToken`, `doctorId`, `especialidadId` y `scheduleDate`.

## 8. Datos demo

Con `DEMO_DATA_ENABLED=true`, el backend crea automáticamente usuarios de prueba con contraseñas BCrypt y datos mínimos para las consultas.

- `admin@citas.local` / `Admin123!`
- `doctor@citas.local` / `Doctor123!`
- `paciente@citas.local` / `Paciente123!`

Desactivar datos demo para un entorno que no sea académico/local:

```text
DEMO_DATA_ENABLED=false
```

## 9. Despliegue mediante JAR

Después de `build`:

```bash
java -jar build/libs/proyecto-0.0.1-SNAPSHOT.jar
```

Las mismas variables de entorno deben estar definidas antes de ejecutar el JAR.
