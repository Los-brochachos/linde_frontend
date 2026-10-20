import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Auth } from './auth';
import { canAccessArea, canAccessSection, homeForRole } from './access';

// Se usa también en canActivateChild: F5 y navegación interna comprueban la sesión.
export const authGuard: CanActivateFn = route => {
  const auth = inject(Auth);
  const router = inject(Router);
  const session = auth.getAccessToken()
    ? auth.usuario() ? of(auth.usuario()!) : auth.cargarUsuario()
    : auth.refreshSession();
  return session.pipe(map(user => {
    const area = route.pathFromRoot.map(r => r.data['area']).filter(Boolean).at(-1);
    if ((route.data['roles'] && !route.data['roles'].includes(user.rol)) || !canAccessArea(user.rol, area) || !canAccessSection(user.rol, route.data['sectionKey']))
      return router.parseUrl(homeForRole(user.rol));
    return true;
  }), catchError(() => {
    auth.clearSession();
    return of(router.parseUrl('/login'));
  }));
};
