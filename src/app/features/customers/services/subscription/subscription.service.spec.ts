import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SubscriptionService } from './subscription.service';
import { ApiService } from '../../../../core/services/api/api.service';
import type { SubscriptionListResponse, Subscription } from '../../../../shared/models/subscription.model';

describe('SubscriptionService', () => {
  it('calls /v1/list/subscription with customer + size + token params', () => {
    const api = { get: vi.fn(), post: vi.fn() } as unknown as ApiService;
    const res: SubscriptionListResponse = { content: [], size: 10, count: 0, next_page_token: 'n' };
    (api.get as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, SubscriptionService],
    });

    const service = TestBed.inject(SubscriptionService);
    service.getSubscriptionsForCustomer('cust', 10, ' tok ').subscribe();

    expect(api.get).toHaveBeenCalledWith('/v1/list/subscription', {
      params: {
        size: '10',
        customer: 'cust',
        page_token: 'tok',
        next_page_token: 'tok',
      },
    });
  });

  it('pauseSubscription posts to /v1/subscription/:handle/on_hold', () => {
    const api = { get: vi.fn(), post: vi.fn() } as unknown as ApiService;
    const res = { handle: 'sub/1', state: 'on_hold', plan: 'p', created: 'now' } as Subscription;
    (api.post as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, SubscriptionService],
    });

    const service = TestBed.inject(SubscriptionService);
    service.pauseSubscription('sub/1').subscribe();

    expect(api.post).toHaveBeenCalledWith('/v1/subscription/sub%2F1/on_hold', {});
  });

  it('reactivateSubscription posts to /v1/subscription/:handle/reactivate', () => {
    const api = { get: vi.fn(), post: vi.fn() } as unknown as ApiService;
    const res = { handle: 'sub 1', state: 'active', plan: 'p', created: 'now' } as Subscription;
    (api.post as unknown as ReturnType<typeof vi.fn>).mockReturnValue(of(res));

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: api }, SubscriptionService],
    });

    const service = TestBed.inject(SubscriptionService);
    service.reactivateSubscription('sub 1').subscribe();

    expect(api.post).toHaveBeenCalledWith('/v1/subscription/sub%201/reactivate', {});
  });
});

