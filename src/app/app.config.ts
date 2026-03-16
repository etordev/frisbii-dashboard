import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_CONFIG } from './core/config/api.config';
import { environment } from '../environments/environment';
import { apiInterceptor } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    {
      provide: API_CONFIG,
      useValue: {
        apiKey: environment.frisbiiApiKey,
        baseUrl: environment.frisbiiApiBaseUrl,
      },
    },
  ],
};
