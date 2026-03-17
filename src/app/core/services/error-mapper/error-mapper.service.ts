import { Injectable } from '@angular/core';
import { ApiError } from '../api/api.service';

export type ErrorContext =
  | 'customers.list'
  | 'customer.detail.load'
  | 'subscriptions.refresh'
  | 'subscriptions.more'
  | 'invoices.more'
  | 'subscriptions.pause'
  | 'subscriptions.unpause'
  | 'unknown';

@Injectable({ providedIn: 'root' })
export class ErrorMapperService {
  toMessage(error: ApiError, context: ErrorContext = 'unknown'): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection and try again.';
    }

    switch (error.status) {
      case 401:
        return 'Unauthorized. Please check your API key.';
      case 403:
        return 'Forbidden. Your API key does not have access.';
      case 404:
        if (context === 'customer.detail.load') return 'Customer not found.';
        return 'Resource not found.';
      default:
        if (error.status >= 500) return 'Server error. Please try again later.';
        return error.message || 'Unexpected error occurred.';
    }
  }
}

