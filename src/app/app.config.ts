import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_CONFIG } from './core/config/api.config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: API_CONFIG,
      useValue: {
        apiKey: environment.frisbiiApiKey,
        baseUrl: environment.frisbiiApiBaseUrl,
      },
    },
  ],
};
