import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { InvoiceService } from './invoice.service';
import { ApiService } from '../../../core/services/api.service';
import type { InvoiceListResponse } from '../../../shared/models/invoice.model';

describe('InvoiceService', () => {
  it('calls /v1/list/invoice with customer + size + token params', () => {
    const api = { get: vi.fn() } as unknown as ApiService;
    const res: InvoiceListResponse = { content: [], size: 10, count: 0, next_page_token: 'n' };
    (api.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, InvoiceService],
    });

    const service = TestBed.inject(InvoiceService);
    service.getInvoicesForCustomer('cust', 10, ' tok ').subscribe();

    expect(api.get).toHaveBeenCalledWith('/v1/list/invoice', {
      params: {
        size: '10',
        customer: 'cust',
        page_token: 'tok',
        next_page_token: 'tok',
      },
    });
  });

  it('omits token params when not provided', () => {
    const api = { get: vi.fn() } as unknown as ApiService;
    const res: InvoiceListResponse = { content: [], size: 10, count: 0 };
    (api.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, InvoiceService],
    });

    const service = TestBed.inject(InvoiceService);
    service.getInvoicesForCustomer('cust', 10).subscribe();

    expect(api.get).toHaveBeenCalledWith('/v1/list/invoice', {
      params: {
        size: '10',
        customer: 'cust',
      },
    });
  });
});

