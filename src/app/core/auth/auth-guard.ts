import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  //ya hay access token en memoria
  if(auth.getAccessToken()){
    return true;
  }

  //Despues de F5, intentamos recuperar la sesion
  return auth.refreshSession().pipe(
    map(()=>true),

    catchError(()=> {
      auth.clearSession();
      return of(
        router.createUrlTree(['/login'])
      );
    })
  );
};
