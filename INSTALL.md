# Instalación

## Requisitos previos

- Java JDK 21.
- Gradle Wrapper incluido en el proyecto (`gradlew` o `gradlew.bat`).
- Node.js y npm, si se utiliza un cliente, script o herramienta auxiliar para pruebas.
- MySQL instalado y ejecutándose.
- Una base de datos llamada `citas_medicas`.

## Instalación paso a paso

1. Clonar el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd proyecto
   ```

2. Verificar Java:

   ```bash
   java -version
   ```

3. Crear la base de datos en MySQL:

   ```sql
   CREATE DATABASE citas_medicas;
   ```

4. Revisar las credenciales de la base de datos en `src/main/resources/application.properties`.
5. Dar permisos de ejecución al wrapper en sistemas Unix, si es necesario:

   ```bash
   chmod +x gradlew
   ```

6. Compilar el proyecto:

   ```bash
   ./gradlew build
   ```

   En Windows usar:

   ```bat
   gradlew.bat build
   ```

## Variables de entorno

La configuración actual de Spring Boot se encuentra en `src/main/resources/application.properties`. Para entornos locales que utilicen un archivo `.env`, se pueden definir variables equivalentes:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/citas_medicas?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=admin123
SERVER_PORT=8080
```

No subir archivos `.env` con credenciales reales al repositorio. El `.gitignore` existente se conserva sin cambios por la restricción de esta entrega; antes de publicar el repositorio, verifica que el `.gitignore` del repositorio incluya `.env`.

## Iniciar el proyecto

Iniciar con Gradle:

```bash
./gradlew bootRun
```

En Windows:

```bat
gradlew.bat bootRun
```

También se puede ejecutar el JAR generado:

```bash
java -jar build/libs/proyecto-0.0.1-SNAPSHOT.jar
```

Por defecto, la aplicación queda disponible en `http://localhost:8080`.

## Convención de commits

Usar el formato `tipo: descripción breve`:

- `feat:` nueva funcionalidad
- `fix:` corrección de errores
- `docs:` cambios en documentación
- `style:` formato, puntos y comas faltantes
- `refactor:` reestructuración de código
- `test:` agregar tests
