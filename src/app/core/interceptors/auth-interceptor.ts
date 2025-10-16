import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const userRaw = localStorage.getItem('user');
  const token = userRaw ? JSON.parse(userRaw)?.access_token : null;

  let clonedReq = req;

  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  }

  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.error?.error === 'Token expired') {
        console.warn('⚠️ ტოკენი ვადაგასულია, ვცდილობთ განახლებას...');

        return auth.refreshToken().pipe(
          switchMap(newToken => {
            console.log('🔄 ახალი ტოკენი მიღებულია:', newToken);
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
              withCredentials: true
            });
            return next(retried);
          }),
          catchError(refreshErr => {
            console.error('❌ ვერ განახლდა ტოკენი, გამოსვლა საჭიროა', refreshErr);
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
