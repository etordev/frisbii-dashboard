import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { API_CONFIG, ApiConfig } from '../../config/api.config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ApiError {
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<ApiConfig>(API_CONFIG);

  get<T>(path: string, options?: object): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(path), options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  post<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(path), body, options)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.baseUrl}${normalizedPath}`;
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const apiError: ApiError = {
        status: error.status,
        message:
          (typeof error.error === 'string' && error.error) ||
          error.error?.message ||
          error.message ||
          'Unexpected error occurred',
      };

      return throwError(() => apiError);
    }

    return throwError(() => ({
      status: 0,
      message: 'Unexpected error occurred',
    } as ApiError));
  }
}

