# Integración de fase3/login-seguridad

Este paquete usa como base el proyecto unificado anterior y reemplaza la autenticación/vistas de seguridad con el aporte de la rama `fase3/login-seguridad` (commit `2770afe`).

Se conservaron del proyecto completo las pantallas funcionales que la rama de login dejaba como `pendiente`: usuarios, roles, médicos, especialidades, horarios/agenda y consultas/diagnóstico.

## Integración activa

- Login, JWT en Angular, sesión local, interceptor Bearer, guards por rol y Lazy Loading: rama `fase3/login-seguridad`.
- Panel administrador: pantallas funcionales del proyecto completo.
- Agenda del doctor: módulo funcional de horarios del proyecto completo.
- Citas/diagnóstico del doctor: módulo funcional de consultas del proyecto completo.
- Paciente: se conserva la vista básica incluida en la rama de login-seguridad.
- Backend Spring Boot y MySQL: se conserva el proyecto completo para no perder endpoints ni reglas de negocio.

## Rutas principales

- `/login`
- `/admin/dashboard`
- `/admin/usuarios`
- `/admin/roles`
- `/admin/medicos`
- `/admin/especialidades`
- `/admin/horarios`
- `/doctor/agenda`
- `/doctor/citas`
- `/paciente/citas`

También se mantienen alias de las rutas antiguas (`/usuarios`, `/medicos`, `/horarios`, `/consultas`, etc.) para no romper funcionalidad previa.
