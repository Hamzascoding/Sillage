import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService, TOKEN_KEY } from './auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem(TOKEN_KEY);

  const request =
    token && req.url.startsWith('/api')
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthCall = req.url.startsWith('/api/auth/');
      if (error.status === 401 && token && !isAuthCall) {
        auth.logout(false);
        router.navigate(['/connexion'], { queryParams: { redirect: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
