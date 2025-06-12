import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthModalService } from '../services/auth-modal.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authModalService: AuthModalService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authModalService.openLoginModal();
        }
        return throwError(() => error);
      })
    );
  }
}