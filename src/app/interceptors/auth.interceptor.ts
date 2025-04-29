import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const tokenService = inject(TokenService);
  const authToken = tokenService.getToken();

  const modifiedReq = authToken
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
      })
    : req;

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.removeToken();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
