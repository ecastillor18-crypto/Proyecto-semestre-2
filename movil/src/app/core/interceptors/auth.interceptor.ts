import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // al login no le pongo token porque todavia no existe, y solo se lo pongo a mi api
  const esLogin = req.url.includes('/auth/login');
  const esMiApi = req.url.startsWith(environment.apiUrl);
  if (esLogin || !esMiApi) {
    return next(req);
  }

  // el token se lee de forma asincrona, por eso uso from y switchMap
  return from(auth.obtenerToken()).pipe(
    switchMap((token) => {
      const peticion = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(peticion);
    }),
    catchError((err: HttpErrorResponse) => {
      // 401 = token vencido o invalido, cierro la sesion
      if (err.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
