import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api/api.service';
import { Customer, CustomerListResponse } from '../../../../shared/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);

  getCustomers(
    size: number,
    handle?: string,
    pageToken?: string,
  ): Observable<CustomerListResponse> {
    const params: { [key: string]: string } = { size: size.toString() };

    if (handle && handle.trim()) {
      params['handle_contains'] = handle.trim();
    }

    if (pageToken && pageToken.trim()) {
      const token = pageToken.trim();
      // Different backends name this cursor differently; sending both is harmless
      // and prevents “always first page” behavior when the param name differs.
      params['page_token'] = token;
      params['next_page_token'] = token;
    }

    return this.api.get<CustomerListResponse>('/v1/list/customer', { params });
  }

  getCustomer(handle: string): Observable<Customer> {
    return this.api.get<Customer>(`/v1/customer/${encodeURIComponent(handle)}`);
  }
}
