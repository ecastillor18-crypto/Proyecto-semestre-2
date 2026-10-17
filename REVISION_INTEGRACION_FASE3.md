# Revisión e integración de la Fase 3

**Proyecto:** Sistema de Citas Médicas y Portal de Salud  
**Revisión:** 9 de octubre de 2026  
**Alcance:** ZIP integrado suministrado por el equipo, revisión de Angular, Spring Boot, DTO y SQL.  
**Importante:** esta es una **copia corregida**, no modifica el ZIP original.

## Resultado

El código tiene la arquitectura principal de Fase 3 integrada. Los contratos de Médicos, Especialidades, Usuarios, JWT y endpoints de Horarios/Consultas tienen correspondencia en el código fuente. Eso **no equivale a afirmar que todo funciona con una instancia real de MySQL**.

### Problema de las tablas: causa identificada

El frontend usa Angular 22 sin `zone.js` y las pantallas asignaban datos dentro de `subscribe()` a arreglos normales (`this.medicos = resultado`, `this.usuarios = resultado`, etc.). En esta configuración, esas asignaciones no garantizan por sí solas que Angular vuelva a renderizar. Un clic sobre un botón o formulario podía provocar la actualización pendiente, que coincide con el comportamiento reportado.

**Solución aplicada:** `ChangeDetectorRef.markForCheck()` después de recibir resultados y errores HTTP en las seis pantallas: Médicos, Especialidades, Usuarios, Roles, Horarios y Consultas. Es un cambio pequeño que conserva los formularios y servicios originales. No fue necesario añadir más dependencias ni reemplazar todas las variables por signals.

**Segundo problema:** la pantalla Médicos y la pantalla Usuarios usaban `forkJoin`. Si una petición fallaba, no se ejecutaba `next` y no aparecían **ninguna** de las listas. Se cambió la carga a consultas independientes; cada tabla puede aparecer aunque falle un catálogo auxiliar. Los errores identifican qué consulta falló.

### Otros ajustes

- Se unificó el URL de Login con `environment.apiUrl` para no depender exclusivamente del proxy de `ng serve`.
- El interceptor solo añade JWT a la API del propio backend, no a URLs externas arbitrarias.
- La validación de expiración del token se realiza cuando se consulta `estaAutenticado()`, en lugar de depender de un `computed()` que puede mantener almacenado el resultado de `Date.now()`.
- Los enlaces del Dashboard pasan a utilizar las rutas canónicas `/admin/*`, conservando los alias antiguos.
- Se añadió bloqueo del botón mientras se envían formularios de Roles y Especialidades, para evitar envíos duplicados.
- Se reordenaron y formatearon las clases TS de las pantallas para hacer más comprensible el código; **no se cambió intencionalmente su comportamiento CRUD**.

## Pruebas realizadas en esta revisión

| Prueba | Resultado | Qué comprueba |
|---|---|---|
| 15 simulaciones de componentes Angular | **15/15 pasan** | Carga con respuestas HTTP simuladas, fallos parciales y señal de actualización visual |
| 35 verificaciones estáticas de integración | **35/35 pasan** | Endpoints, modelos/DTO, rutas, roles, parámetros y correcciones aplicadas |
| Análisis sintáctico TypeScript | **44 archivos, 0 errores de parseo** | Sintaxis de archivos TS dentro de `frontend/src` |
| `npm ci --offline` | **No se puede completar aquí** | No están cacheadas las dependencias de Angular; el entorno de pruebas tiene Node 22.16.0 y varias dependencias requieren 22.22.2+ |
| `npm run build` y `npm test` | **No ejecutados** | Faltan dependencias Angular instaladas en el entorno |
| `gradlew test`, arranque Spring y pruebas HTTP/MySQL | **No ejecutados** | No existe la distribución Gradle en caché ni un servidor MySQL disponible para esta revisión |
| Navegación real en un navegador | **No ejecutada** | Requiere levantar frontend y backend |

Las pruebas simuladas son útiles para detectar regresiones de flujo, pero **no prueban compilación Angular, compilación Java, compatibilidad con una base real ni funcionamiento de red**.

## Funcionalidades por persona (estado a partir del código)

| Integrante | Funcionalidades encontradas | Archivos principales |
|---|---|---|
| 1: Login/seguridad | Login JWT, sesión en navegador, interceptor, guards, menús por rol, rutas `/admin`, `/doctor`, `/paciente` | `core/services/auth.service.ts`, `core/guards/auth.guards.ts`, `core/interceptors/auth.interceptor.ts`, `app.routes.ts` |
| 2: Usuarios/roles | Pantallas y CRUD, selección de rol, validaciones, servicios HTTP | `features/usuarios/`, `features/roles/`, `core/services/{usuario,rol}.service.ts` |
| 3: Médicos/especialidades | Pantallas y CRUD, selección de usuario doctor y especialidades, modelos y services | `features/medicos/`, `features/especialidades/`, `core/models/{medico,especialidad}.model.ts`, `core/services/{medico,especialidad}.service.ts` |
| 4: Horarios/agenda | Alta, edición, consulta y cancelación de horarios; vista para admin y doctor | `features/horarios/`, `core/services/horario.service.ts`, `ScheduleController.java` |
| 5: Citas del doctor | Agenda del doctor, atención, diagnóstico, receta | `features/consultas/`, `core/services/cita.service.ts`, `AppointmentController.java` |

**Limitación de alcance:** `features/paciente/citas.component.ts` contiene solo “Mis citas / pendiente”. La parte móvil del paciente pertenece a Fase 4; esta vista del panel web no constituye una implementación completa de citas del paciente.

## Explicación sencilla de la Persona 3

### 1. `medico.model.ts`: forma de los datos

```ts
export interface MedicoAdmin {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  numeroColegiado: string;
  aniosExperiencia: number;
  biografia: string | null;
  especialidades: Especialidad[];
}
```

- `interface`: describe la estructura; no llama a MySQL.
- `id`: identificador del perfil médico.
- `usuarioId`: usuario con `ROLE_DOCTOR` vinculado a ese perfil.
- `Especialidad[]`: arreglo/lista de especialidades.
- `string | null`: puede contener texto o no contener dato.

El otro modelo es `MedicoRequest`: lo que se **envía** al backend. Incluye `usuarioId`, `numeroColegiado`, `aniosExperiencia`, `biografia` y `especialidadIds: number[]`. Fíjate: **en esta versión integrada** no se envía `usuario: {id}` ni `especialidades: [{id}]`. El backend ahora utiliza el DTO `MedicoAdminRequest.java` y espera directamente IDs.

### 2. `especialidad.model.ts`: catálogo

```ts
export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
}
```

Una especialidad tiene ID, nombre y una descripción opcional. Es un **tipo**, no una consulta.

### 3. `medico.service.ts`: comunicación HTTP

```ts
listarAdmin(): Observable<MedicoAdmin[]> {
  return this.http.get<MedicoAdmin[]>(this.adminUrl);
}
```

- `listarAdmin()` es un método creado por el equipo.
- `HttpClient` viene de Angular.
- `get` pide `/api/medicos` a Spring.
- `<MedicoAdmin[]>` describe la **respuesta esperada**: lista de médicos.
- `Observable` representa esa respuesta asíncrona. La petición se ejecuta al suscribirse desde la pantalla.

También contiene `crear()` (`POST`), `actualizar()` (`PUT`), `eliminar()` (`DELETE`), `listarPublicos()` y `miPerfil()`.

### 4. `medicos-page.component.ts`: pantalla

Al entrar a Médicos, Angular ejecuta `ngOnInit()` y este llama a `cargar()`. Ahora `cargar()` consulta por separado tres recursos:

```ts
this.service.listarAdmin().subscribe({
  next: medicos => {
    this.medicos = medicos;
    this.cdr.markForCheck();
  },
  error: e => {
    this.errorMessage = 'Médicos: ' + apiErrorMessage(e);
    this.cdr.markForCheck();
  }
});
```

- `subscribe()` escucha la respuesta del servidor.
- `next`: se ejecuta si llegó una lista válida.
- `this.medicos = medicos`: guarda los resultados para que `@for` dibuje las filas.
- `markForCheck()`: informa a Angular que **debe actualizar la pantalla**.
- `error`: muestra un mensaje si falló la petición.

**¿Por qué hay tres consultas?** Una obtiene médicos para la tabla, otra usuarios para seleccionar doctores y la tercera especialidades para los checkboxes. Ahora un error en usuarios no oculta la lista de médicos.

### 5. `guardar()`: creación o edición

1. Comprueba que el formulario sea válido y exista al menos una especialidad seleccionada.
2. Lee el formulario con `getRawValue()`.
3. Crea el objeto `MedicoRequest` con `usuarioId`, colegiado, años, biografía e IDs de especialidades.
4. Si `editingId` existe llama a `actualizar(id, payload)`; de lo contrario, `crear(payload)`.
5. Se suscribe al resultado. Si Spring acepta, muestra el éxito, limpia el formulario y llama a `cargar()` para actualizar la tabla.
6. Spring recibe la petición en `MedicoController.java`, la procesa en `MedicoService.java`, consulta repositories y guarda en MySQL.

### 6. `especialidad.service.ts` y su pantalla

Es el mismo patrón, más sencillo: `GET /api/especialidades` lista, `POST` crea, `PUT /{id}` actualiza y `DELETE /{id}` elimina. La pantalla usa `form`, `guardar()`, `editar()`, `eliminar()` y ahora notifica a Angular con `markForCheck()` después de recibir la respuesta.

## Guía de prueba completa en Windows (pendiente en esta revisión)

**En terminal 1: backend**

1. Importa `schema_completo.sql` en MySQL (si la base está vacía). **No vuelvas a importar a ciegas una base existente**: revisa los scripts de migración primero.
2. Configura Java 21, `DB_USERNAME`, `DB_PASSWORD` y `JWT_SECRET` de al menos 32 bytes.
3. Ejecuta `gradlew.bat clean test` y después `gradlew.bat bootRun`.
4. Comprueba que Spring arranque sin errores y escuche en `localhost:8080`.

**En terminal 2: Angular**

1. Comprueba `node -v`. La versión debe cumplir los requisitos que indique `npm install`; en esta revisión algunas dependencias exigían Node 22.22.2 o superior.
2. En `frontend`, ejecuta `npm ci`, `npm run build`, `npm start`.
3. Abre `http://localhost:4200`.

**Pruebas de extremo a extremo**

- Login ADMIN: debe abrir `/admin/dashboard`.
- En ADMIN > Usuarios: debe mostrar filas **sin tocar el formulario**.
- En ADMIN > Médicos: la tabla, el selector de doctores y las especialidades deben cargar **sin ningún clic adicional**.
- En ADMIN > Especialidades: la lista debe cargar sola; crear/editar/eliminar debe refrescarla.
- Crear usuario con rol DOCTOR y luego asignarle un perfil médico, con una especialidad válida.
- Probar validaciones: sin colegiado, sin especialidad y años negativos.
- Login DOCTOR: debe abrir `/doctor/agenda`, mostrar su agenda y `/doctor/citas`.
- En Consultas: atender una cita, guardar diagnóstico y receta; verificar que la información se guardó.
- Login PATIENT: abre `/paciente/citas`, pero esa vista está pendiente (no equivale a Fase 4 terminada).
- En Chrome `F12 → Network → Fetch/XHR`, comprobar los `GET /api/...` y sus estados: `200` datos; `401` sesión/token; `403` permisos; `500` error del backend.

Si una tabla sigue sin cargar **después de esta corrección**, primero hay que comprobar si la petición devuelve `200` y JSON válido: podría existir otro error del backend, MySQL, permisos o datos.

## Simplificación y observaciones pendientes

- El código integrado cumple una estructura bastante estándar para un proyecto universitario: **componentes → servicios Angular → controllers Spring → services Spring → repositories → MySQL**.
- El archivo `core/interceptors/api-error.interceptor.ts` existe, pero **no está registrado** en `app.config.ts`. El manejo actual lo realiza `auth.interceptor.ts` y los componentes mediante `apiErrorMessage()`; evitar activar ambos sin revisar su duplicación de logout.
- Hay partes del código escritas en una sola línea. En esta copia se formatearon las clases de seis pantallas para facilitar explicación y mantenimiento.
- Queda pendiente ejecutar pruebas completas en tu equipo, incluyendo builds Angular y Java, MySQL, permisos de usuario y navegadores reales.

**Conclusión:** se identificaron y corrigieron **dos causas concretas del fallo de carga de tablas**, pero no sería correcto asegurar funcionamiento total sin ejecutar la aplicación real y sus dependencias.
