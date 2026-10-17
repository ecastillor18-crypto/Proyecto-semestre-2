# Cómo ejecutar el proyecto

## 1. Base de datos MySQL

Ejecuta primero `schema_completo.sql` en MySQL Workbench (o desde consola). El script crea la base `citas_medicas`, tablas, llaves, roles y especialidades base.

## 2. Backend Spring Boot

Requisitos: Java 21 y MySQL en ejecución.

En CMD de Windows, desde la carpeta del proyecto:

```cmd
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
set JWT_SECRET=clave_local_para_jwt_de_al_menos_32_caracteres_123456
set DB_USERNAME=root
set DB_PASSWORD=TU_PASSWORD_MYSQL
gradlew.bat bootRun
```

Si tu usuario root no tiene contraseña, puedes omitir `DB_PASSWORD`.

El backend usa `http://localhost:8080`.

Con `DEMO_DATA_ENABLED=true` (valor por defecto), al iniciar se crean datos demo si no existen:

- ADMIN: `admin@citas.local` / `Admin123!`
- DOCTOR: `doctor@citas.local` / `Doctor123!`
- PACIENTE: `paciente@citas.local` / `Paciente123!`

## 3. Frontend Angular

Abre otra terminal:

```cmd
cd frontend
npm install
npm start
```

Angular se abre normalmente en `http://localhost:4200`.
