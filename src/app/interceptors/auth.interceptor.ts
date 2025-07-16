import type {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthModalService } from '../services/auth-modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authModalService = inject(AuthModalService);

  // Clone the request and add credentials for cross-origin requests
  const authReq = req.clone({
    setHeaders: {},
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authModalService.openLoginModal();
      }
      else if (error.status === 403) {
        authModalService.redirectToForbiddenPage();
      }
      return throwError(() => error);
    })
  );
};
