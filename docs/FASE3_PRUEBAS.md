# Checklist de pruebas - Fase 3

## Antes de iniciar

1. Ejecutar `database/migrate_fase3.sql` una sola vez si la base ya viene de Fase 2.
2. Opcional: ejecutar `database/verify_fase3.sql` para confirmar las columnas nuevas.
3. Configurar `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` y `DEMO_DATA_ENABLED=true`.
4. Iniciar Spring Boot en `http://localhost:8080`.
5. En `frontend`, ejecutar `npm install` y luego `npm start`.

## Pruebas de seguridad

- [ ] Sin iniciar sesión, `/usuarios` redirige a `/login`.
- [ ] ADMIN puede abrir Usuarios, Roles, Médicos, Especialidades y Horarios.
- [ ] DOCTOR no puede abrir `/usuarios` aunque escriba la URL manualmente.
- [ ] DOCTOR puede abrir Horarios y Mis citas.
- [ ] Las solicitudes protegidas llevan `Authorization: Bearer <JWT>`.
- [ ] Si el JWT vence o Spring responde 401, Angular cierra la sesión.

## Usuarios

- [ ] Crear un usuario con contraseña de 8 o más caracteres.
- [ ] Verificar que puede iniciar sesión si se le asignó un rol válido.
- [ ] Editar datos sin escribir contraseña y comprobar que la contraseña anterior sigue funcionando.
- [ ] Cambiar contraseña escribiendo una nueva.
- [ ] Activar/inactivar usuario.

## Médicos y especialidades

- [ ] Crear primero un usuario ROLE_DOCTOR.
- [ ] Crear un perfil médico asociado a ese usuario.
- [ ] Asignar una o más especialidades.
- [ ] Editar colegiado, experiencia, biografía y especialidades.
- [ ] Crear/editar especialidades.

## Horarios

- [ ] ADMIN crea un horario para cualquier médico.
- [ ] DOCTOR crea un horario únicamente para sí mismo.
- [ ] Intentar crear un bloque cruzado y comprobar que Spring lo rechaza.
- [ ] Intentar hora final menor o igual a inicio y comprobar validación Angular/Spring.
- [ ] Cancelar un horario DISPONIBLE.
- [ ] Confirmar que un horario RESERVADO no se puede editar/cancelar directamente.

## Consulta médica

- [ ] Ingresar como DOCTOR.
- [ ] Ver citas de una fecha.
- [ ] Abrir Atender.
- [ ] Registrar diagnóstico y receta.
- [ ] Comprobar que la cita cambia a COMPLETADA.
- [ ] Confirmar que el doctor no puede atender una cita de otro médico.

## Comandos de compilación

Backend:

```powershell
.\gradlew.bat clean test
.\gradlew.bat bootRun
```

Frontend:

```powershell
cd frontend
npm install
npm run build
npm start
```
