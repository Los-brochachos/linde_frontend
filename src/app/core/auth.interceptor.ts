import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const base = inject(API_URL);
  const privateApi = request.url.startsWith(`${base}/api/v1/`);
  const token = auth.accessToken();
  const authenticated = privateApi && token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authenticated).pipe(catchError(error => {
    if (privateApi && error.status === 401) auth.logout();
    return throwError(() => error);
  }));
};
