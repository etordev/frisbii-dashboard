/**
 * Customer model for list/detail view (Frisbii/Reepay API).
 * Name is built from first_name + last_name.
 */
export interface Customer {
  handle: string;
  email: string;
  company: string;
  first_name: string;
  last_name: string;
  created: string;
}

/* Response shape for GET /v1/list/customer. */
export interface CustomerListResponse {
  content: Customer[];
  size: number;
  count: number;
  next_page_token?: string;
  from?: string;
  to?: string;
  range?: string;
}