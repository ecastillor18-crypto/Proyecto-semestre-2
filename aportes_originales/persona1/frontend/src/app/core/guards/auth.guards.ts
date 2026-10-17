import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/auth.models';

//solo nos deja pasar si hay sesion valida
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

//si ya inicio sesion no tiene sentido ver el login otra vez
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estaAutenticado() ? router.parseUrl(auth.rutaInicio()) : true;
};


export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Rol[];
  return auth.tieneRol(roles) ? true : router.parseUrl('/no-autorizado');
};

//la ruta vacia manda a cada rol a su zona
export const inicioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return inject(Router).parseUrl(auth.rutaInicio());
};
