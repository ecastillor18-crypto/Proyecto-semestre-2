# Revisión de pruebas manuales — Fase 3

Cambios realizados sobre la versión integrada corregida:
- Login: los avisos de validación aparecen al intentar ingresar, no al cambiar de campo.
- Usuarios y Médicos: errores 409 por dependencias en MySQL se explican claramente; NO se eliminan a la fuerza registros clínicos.
- Selector de Médicos: mensaje cuando no quedan usuarios DOCTOR sin perfil asignado.
- Textos instructivos sobre Spring/Angular retirados de las pantallas para dejar un panel normal.
- Se retira la ruta/pestaña web del paciente en esta fase; el rol PATIENT y backend permanecen para la Fase 4.
- Se conservan las correcciones previas `markForCheck` y cargas independientes.

## Observaciones
- 13/09/2026 es anterior a 10/10/2026: el rechazo de la fecha es correcto. Para crear un horario elige una fecha actual/futura.
- Horarios existentes de 2029 pueden verse en la tabla aunque no deban poder crearse horarios en el pasado.
- No se ha realizado una prueba real con MySQL/servidor en este entorno.
- La eliminación puede fallar por vínculos de usuarios a perfiles médicos y médicos a agendas/citas. Preferible inactivar usuarios o preservar historiales.
- Para dar de alta otro médico, crea un nuevo usuario con ROLE_DOCTOR; el usuario de María López ya está asociado a un perfil.

## Pruebas en Windows
1. `./gradlew.bat clean test` (PowerShell: `.\gradlew.bat clean test`)
2. `./gradlew.bat bootRun` (PowerShell: `.\gradlew.bat bootRun`)
3. En `frontend`: `npm install`, `npm run build`, `npm start`
4. Validar login, alta de otro usuario DOCTOR, alta/edición de perfil médico, fecha futura de horarios y consultas doctor.
