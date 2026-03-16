import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SubscriptionListResponse, Subscription } from '../../../shared/models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  getSubscriptionsForCustomer(customerHandle: string, size: number): Observable<SubscriptionListResponse> {
    const params = {
      size: String(size),
      customer: customerHandle,
    };

    return this.api.get<SubscriptionListResponse>('/v1/list/subscription', { params });
  }

  pauseSubscription(handle: string): Observable<Subscription> {
    return this.api.post<Subscription>(`/v1/subscription/${encodeURIComponent(handle)}/on_hold`, {});
  }

  reactivateSubscription(handle: string): Observable<Subscription> {
    return this.api.post<Subscription>(`/v1/subscription/${encodeURIComponent(handle)}/reactivate`, {});
  }
}
