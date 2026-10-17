import { HttpErrorResponse } from '@angular/common/http';

interface BackendError {
  message?: string;
  error?: string;
}

export function mensajeApi(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado.';
  }

  const backend = error.error as BackendError | null;
  const detalle = backend?.message?.trim();
  if (detalle) return detalle;

  switch (error.status) {
    case 0:
      return 'No se pudo conectar con el servidor.';
    case 400:
      return 'La solicitud contiene datos inválidos.';
    case 401:
      return 'Tu sesión venció o no es válida. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'No se encontró la cita solicitada.';
    case 409:
      return 'La operación no puede realizarse por el estado actual de la cita.';
    default:
      return 'No se pudo completar la operación.';
  }
}
