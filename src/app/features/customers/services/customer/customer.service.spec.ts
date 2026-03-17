import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CustomerService } from './customer.service';
import { ApiService } from '../../../../core/services/api/api.service';
import type { CustomerListResponse } from '../../../../shared/models/customer.model';

describe('CustomerService', () => {
  it('calls /v1/list/customer with size + handle_contains + token params', () => {
    const api = { get: vi.fn() } as unknown as ApiService;
    const res: CustomerListResponse = { content: [], size: 30, count: 0, next_page_token: 'n' };
    (api.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, CustomerService],
    });

    const service = TestBed.inject(CustomerService);
    service.getCustomers(30, '  bob ', ' tok ').subscribe();

    expect(api.get).toHaveBeenCalledWith('/v1/list/customer', {
      params: {
        size: '30',
        handle_contains: 'bob',
        page_token: 'tok',
        next_page_token: 'tok',
      },
    });
  });

  it('omits handle_contains and token when not provided', () => {
    const api = { get: vi.fn() } as unknown as ApiService;
    const res: CustomerListResponse = { content: [], size: 10, count: 0 };
    (api.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, CustomerService],
    });

    const service = TestBed.inject(CustomerService);
    service.getCustomers(10).subscribe();

    expect(api.get).toHaveBeenCalledWith('/v1/list/customer', {
      params: { size: '10' },
    });
  });
});

