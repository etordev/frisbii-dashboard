import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { API_CONFIG, ApiConfig } from '../config/api.config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const config = inject<ApiConfig>(API_CONFIG);

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Basic ${btoa(`${config.apiKey}:`)}`,
    },
  });

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Let ApiService handle shaping the error for its callers.
      return throwError(() => error);
    }),
  );
};

