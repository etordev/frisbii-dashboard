import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api/api.service';
import { InvoiceListResponse } from '../../../../shared/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly api = inject(ApiService);

  getInvoicesForCustomer(
    customerHandle: string,
    size: number,
    pageToken?: string,
  ): Observable<InvoiceListResponse> {
    const params: { [key: string]: string } = {
      size: String(size),
      customer: customerHandle,
    };

    if (pageToken && pageToken.trim()) {
      const token = pageToken.trim();
      params['page_token'] = token;
      params['next_page_token'] = token;
    }

    return this.api.get<InvoiceListResponse>('/v1/list/invoice', { params });
  }
}
