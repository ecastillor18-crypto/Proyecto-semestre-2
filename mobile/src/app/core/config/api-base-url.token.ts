import { InjectionToken } from '@angular/core';

/**
 * URL base del backend Spring Boot.
 * Al integrar con la aplicación móvil completa, este valor puede reemplazarse con environment.apiUrl.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8080',
});
