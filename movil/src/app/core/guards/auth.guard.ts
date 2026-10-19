import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// protege las pantallas privadas, sin sesion lo mando al login
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.estaLogueado()) {
    return true;
  }
  return router.parseUrl('/login');
};

// si ya hay sesion no tiene sentido mostrar el login otra vez
export const loginGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.estaLogueado()) {
    return router.parseUrl('/tabs/home');
  }
  return true;
};
