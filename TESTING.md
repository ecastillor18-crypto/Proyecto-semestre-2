# Guía de testing

Esta guía describe cómo probar la autenticación y los endpoints de personas con la colección `postman_collection.json`.

> **Nota sobre el checkout actual:** la colección usa las rutas solicitadas (`/api/auth/login` y `/api/personas`). En el código disponible actualmente se observan `/api/usuarios`, `POST` y `DELETE`, pero no se observan un endpoint de login, `/api/personas` ni `PUT`. La colección quedará lista para ejecutarse cuando esos endpoints estén disponibles o cuando el backend exponga las rutas indicadas.

## Importar la colección

1. Abrir Postman.
2. Seleccionar **Import**.
3. Elegir el archivo `postman_collection.json` de la raíz del proyecto.
4. Confirmar la importación.
5. Abrir la colección y seleccionar las variables de colección o un environment con los mismos nombres.

## Variables

Configurar estas variables antes de ejecutar las solicitudes:

| Variable | Ejemplo | Descripción |
|---|---|---|
| `baseUrl` | `http://localhost:8080` | URL base de la API |
| `token` | *(vacío inicialmente)* | Token generado por el login |
| `personaId` | `1` | Identificador usado en PUT y DELETE |

El test de **Iniciar sesión** busca `token` o `access_token` en la respuesta y guarda automáticamente el valor en la variable de colección `token`.

## Login

**Request**

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta esperada: `200 OK` o `201 Created`**

```json
{
  "token": "eyJ..."
}
```

Ejecutar este request primero. Si el login es correcto, las solicitudes protegidas utilizarán `Bearer {{token}}` automáticamente.

## Endpoints de personas

Todas las solicitudes de esta sección envían el header:

```http
Authorization: Bearer {{token}}
```

### Listar personas

```http
GET {{baseUrl}}/api/personas
```

Respuesta esperada: `200 OK` con un arreglo JSON de personas.

### Crear persona

```http
POST {{baseUrl}}/api/personas
Content-Type: application/json
```

```json
{
  "nombre": "Ana",
  "apellido": "García",
  "email": "ana.garcia@ejemplo.com",
  "telefono": "3001234567"
}
```

Respuesta esperada: `201 Created` o `200 OK` con la persona creada.

### Actualizar persona

```http
PUT {{baseUrl}}/api/personas/1
Content-Type: application/json
```

```json
{
  "nombre": "Ana María",
  "apellido": "García",
  "email": "ana.garcia@ejemplo.com",
  "telefono": "3009876543"
}
```

Respuesta esperada: `200 OK` con la persona actualizada.

### Eliminar persona

```http
DELETE {{baseUrl}}/api/personas/1
```

Respuesta esperada: `204 No Content` o `200 OK`.

## Ejecución recomendada

1. Iniciar la aplicación y comprobar que responde en `{{baseUrl}}`.
2. Ejecutar **Autenticación > Iniciar sesión**.
3. Confirmar que el test guarda `token`.
4. Ejecutar **Personas > Listar personas**.
5. Ejecutar **Crear persona** y guardar el identificador devuelto en `personaId`.
6. Ejecutar **Actualizar persona**.
7. Ejecutar **Eliminar persona**.

Para validar la autenticación, repetir una solicitud de personas con un token vacío o inválido. La respuesta esperada es `401 Unauthorized` o `403 Forbidden`, según la configuración de seguridad del backend.
