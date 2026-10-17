import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models/api-error.model';

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';
  const body = error.error as ApiErrorBody | string | null;
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    if (body.validationErrors) {
      const first = Object.values(body.validationErrors)[0];
      if (first) return first;
    }
    if (body.message) return body.message;
  }
  if (error.status === 0) return 'No se pudo conectar con Spring Boot en http://localhost:8080.';
  if (error.status === 403) return 'No tienes permisos para realizar esta operación.';
  return `Error ${error.status}: ${error.statusText || 'petición fallida'}`;
}
