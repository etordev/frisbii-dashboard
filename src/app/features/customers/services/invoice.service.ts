import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InvoiceListResponse } from '../../../shared/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly api = inject(ApiService);

  getInvoicesForCustomer(customerHandle: string, size: number): Observable<InvoiceListResponse> {
    const params = {
      size: String(size),
      customer: customerHandle,
    };

    return this.api.get<InvoiceListResponse>('/v1/list/invoice', { params });
  }
}
