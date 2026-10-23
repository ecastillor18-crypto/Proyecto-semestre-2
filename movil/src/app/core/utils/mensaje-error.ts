import { HttpErrorResponse } from '@angular/common/http';

// convierte un error http en un mensaje claro para el paciente
export function mensajeError(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    switch (e.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Revisa tu conexión.';
      case 400:
        return 'La solicitud no es válida.';
      case 401:
        return 'Tu sesión expiró. Inicia sesión de nuevo.';
      case 403:
        return 'No tienes permiso para ver esta información.';
      case 404:
        return 'No se encontró la información solicitada.';
      case 409:
        return 'Hubo un conflicto con los datos, intenta de nuevo.';
      default:
        if (e.status >= 500) return 'El servidor tuvo un problema, intenta más tarde.';
    }
  }
  return 'Ocurrió un error, intenta de nuevo.';
}
