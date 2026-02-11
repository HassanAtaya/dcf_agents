import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';
      let errorDetail = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = 'Network Error';
        errorDetail = error.error.message;
      } else {
        const extract = (): string => {
          if (typeof error.error === 'string') return error.error.substring(0, 200);
          if (error.error?.message) return error.error.message;
          if (error.error?.error) return error.error.error;
          return 'Unknown error';
        };

        switch (error.status) {
          case 400: errorMessage = 'Invalid Request'; errorDetail = extract(); break;
          case 401:
            // Suppress generic 401 popup when we are already on/login page
            // or during login request itself (normal flow).
            const isLoginRequest = req.url.includes('/api/auth/login');
            const isOnLoginPage = typeof location !== 'undefined' && location.pathname.startsWith('/login');
            if (isLoginRequest || isOnLoginPage) {
              return throwError(() => error);
            }
            errorMessage = 'Unauthorized';
            errorDetail = 'Please login to continue';
            break;
          case 403: errorMessage = 'Forbidden'; errorDetail = 'You do not have permission'; break;
          case 404: errorMessage = 'Not Found'; errorDetail = extract(); break;
          case 409: errorMessage = 'Conflict'; errorDetail = extract(); break;
          case 500: errorMessage = 'Server Error'; errorDetail = extract(); break;
          case 0: errorMessage = 'Connection Failed'; errorDetail = 'Cannot connect to server'; break;
          default: errorMessage = `Error ${error.status}`; errorDetail = extract();
        }
      }

      messageService.add({
        severity: 'error', summary: errorMessage, detail: errorDetail, life: 5000
      });

      return throwError(() => error);
    })
  );
};
