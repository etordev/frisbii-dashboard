/**
 * Subscription model for list view (Frisbii/Reepay API).
 * State: active, cancelled, expired, on_hold (default to "unknown" for others).
 */
export interface Subscription {
  handle: string;
  state: string;
  plan: string;
  created: string;
}

/* Response shape for GET /v1/list/subscription. */
export interface SubscriptionListResponse {
  content: Subscription[];
  size: number;
  count: number;
  next_page_token?: string;
  from?: string;
  to?: string;
  range?: string;
}
