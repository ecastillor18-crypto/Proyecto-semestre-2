import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const esLogin = req.url.includes('/auth/login');
  const token = auth.token();

  //le pongo el bearer a todo menos al login
  const peticion = token && !esLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esLogin) auth.logout(true); //token vencido o invalido
      if (err.status === 403) router.navigate(['/no-autorizado']);
      return throwError(() => err);
    })
  );
};
