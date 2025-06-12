import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthModalService } from '../services/auth-modal.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authModalService = inject(AuthModalService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authModalService.openLoginModal();
      }
      return throwError(() => error);
    })
  );
};