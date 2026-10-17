# Validación técnica realizada sobre Fase 3

## Comprobaciones realizadas

- Se validaron los JSON de configuración de Angular (`package.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`).
- Se revisaron 42 archivos TypeScript del frontend.
- No hay imports relativos de TypeScript apuntando a archivos inexistentes.
- No hay archivos fuente vacíos.
- Se realizó una comprobación estática TypeScript con declaraciones temporales de Angular/RxJS y terminó sin errores propios del código.
- Se revisó sintaxis Java de los cambios; no se detectaron errores sintácticos en los archivos modificados.
- Se revisó el mapeo principal Angular -> endpoint REST -> Controller -> Service.
- Se confirmó que Angular usa `http://localhost:8080` y que el CORS de Spring admite `http://localhost:4200`.

## Limitación del entorno de validación

No fue posible ejecutar una compilación real completa con `npm install` / `ng build` ni descargar la distribución del Gradle Wrapper porque este entorno no tiene acceso de red para descargar dependencias externas. Por eso la validación final debe ejecutarse en la PC del equipo.

Angular 22 necesita Node.js compatible. El proyecto declara `node >=22.22.3`.

## Validación final que debe hacerse en Windows

### Backend

```powershell
.\gradlew.bat clean test
.\gradlew.bat bootRun
```

### Frontend

```powershell
node --version
cd frontend
npm install
npm run build
npm start
```

Si la base de datos ya fue creada en Fase 2, ejecutar antes una sola vez:

```text
database/migrate_fase3.sql
```
