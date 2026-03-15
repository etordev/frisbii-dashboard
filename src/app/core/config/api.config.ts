import { InjectionToken } from '@angular/core';

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

export interface ApiConfig {
  apiKey: string;
  baseUrl: string;
}
