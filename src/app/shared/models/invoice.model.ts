/**
 * Invoice model for list view (Frisbii/Reepay API).
 * @see https://api.reepay.com/openapi.json
 */
export interface Invoice {
  id: string;
  handle: string;
  state: string;
  amount: number;
  currency: string;
  created: string;
}

/**
 * Response shape for GET /v1/list/invoice.
 */
export interface InvoiceListResponse {
  content: Invoice[];
  size: number;
  count: number;
  next_page_token?: string;
  from?: string;
  to?: string;
  range?: string;
}
