# Frisbii Subscription Management Dashboard

Subscription management dashboard built with Angular v21 using the Frisbii API. It supports customer listing + search, customer detail (invoices/subscriptions), subscription lifecycle actions (pause/unpause), infinite scrolling, and toast notifications.

## Features

- Customer list view (handle, name, email, company, created date)
- Search by customer handle (debounced + stored in query params)
- Customer detail view (customer info + invoices + subscriptions)
- Invoice list (state indicators, amount + currency, created date) with infinite scroll
- Subscription list (state indicators, plan handle, created date) with pause/unpause actions + infinite scroll
- Routing + navigation (active route styling + not-found fallback)
- Loading and error states for API calls
- Toast notifications for success/error feedback

## Requirements

- Node.js **20+**
- npm **10+**

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment (API key is **never committed**):

- Copy `src/environments/environment.example.ts` → `src/environments/environment.ts`
- Set:
  - `frisbiiApiKey` to your private API key (e.g. `priv_xxx`)
  - `frisbiiApiBaseUrl` (default is `https://api.frisbii.com`)

`src/environments/environment.ts` is gitignored.

## Run

Start the dev server:

```bash
npm start
```

Open `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Unit tests

```bash
npm test
```

## Architecture decisions

- **Signals for state**: pages use Angular Signals for UI state (`loading`, `error`, data lists, pagination tokens).
- **Services for API + business logic**: dedicated services per resource (`CustomerService`, `InvoiceService`, `SubscriptionService`) plus shared/core services.
- **Auth via HTTP interceptor**: adds `Authorization: Basic ...` header using the configured API key.
- **Reusable UI components**:
  - `data-table`: reusable table component with optional fixed height and internal scrolling; emits `bottomReached` for infinite scroll.
  - `toast-container` + `ToastService`: lightweight toasts without external UI libraries.

## Project structure

- `src/app/core/`: application-wide services and infrastructure (API service, auth interceptor, error mapping, toast service, not-found page).
- `src/app/shared/`: reusable UI/components and shared models (`data-table`, loading/empty states, toast container, typed models).
- `src/app/features/`: feature modules/pages/components (customers list + customer detail, invoices/subscriptions tables).
- `src/environments/`: environment configuration (`environment.ts` is local-only and gitignored).

## Routing

- Uses Angular Router with:
  - **Route params**: `customer/:handle` for customer detail.
  - **Query params**: `handle` filter on the customer list (keeps search state in the URL).
  - **Fallback route**: unknown paths redirect to the not-found page.

## Error handling

- API calls surface failures as user-friendly messages via `ErrorMapperService`.
- Handles common HTTP scenarios:
  - **401/403**: unauthorized/forbidden messages
  - **404**: special-case “customer not found” on the detail route, otherwise generic not found
  - **5xx**: server error message
- UI shows **loading** and **error** states on pages, plus **toast feedback** for action/pagination errors where relevant.

## API & data handling

- **Typed responses**: API responses are modeled with TypeScript interfaces (no `any`).
- **Cursor pagination**: list endpoints use `next_page_token`; the next request continues from that token.
- **RxJS usage**: HTTP calls return Observables; debounced search uses RxJS `Subject` + `debounceTime`; subscriptions are cleaned up with `takeUntilDestroyed`.

## Assumptions / notes

- **Pagination**: list endpoints return `next_page_token`. Requests send the token as both `page_token` and `next_page_token` to stay compatible with backend parameter naming.
- **Duplicate prevention**: when loading more, results are deduped (by `handle`/`id`) to avoid repeated items if the backend returns overlapping pages.
- **Chunk sizes**:
  - Customers: initial chunk of 30
  - Invoices/subscriptions: 10 per request (infinite scroll)
- **No optimistic updates** for pause/unpause: UI waits for the backend success response, then refreshes the list to reflect the server state.

## Bonus features implemented

- **Service unit tests** (`*.spec.ts`) for customer/subscription/invoice/core services
- **Toast notifications** for success/error
- **Infinite scrolling** for customers, invoices, and subscriptions
- **Full-height layout** with internal table scrolling (no `calc()` height hacks)
- **Sticky table headers**

## Security / dependency note

`npm audit` may report **2 high vulnerabilities** from transitive dependencies (`undici` via `@angular/build`). The suggested fix requires `npm audit fix --force` (potentially breaking upgrades), so it was intentionally not applied for this challenge.

## Challenges faced & how they were solved

- **Avoiding “double scroll”**: used flex layouts with `overflow: hidden` on parents and a dedicated scroll container for tables.
- **Reliable infinite scroll**: used cursor tokens + deduping to avoid repeated pages when the backend returns overlapping results.
- **Testing services**: mocked the API layer to assert endpoint + query params without real HTTP calls.

## AI usage disclosure

I used **Cursor** (with its AI assistant) to accelerate implementation and reduce boilerplate. I used it primarily for:

- Layout patterns for full-height flex + internal scrolling
- Pagination/infinite scroll structure using `next_page_token`
- Toast architecture without installing external libraries
- Service unit test scaffolding and mocking patterns

Example prompts:
- “Implement full-height table layout with internal scrolling using Flexbox”
- “Add infinite scroll using cursor token pagination”
- “Write unit tests for services mocking the API layer”
- “Implement toast notifications without external libraries”

What went well:
- Faster iteration on structure/boilerplate and catching edge cases.

What needed manual review:
- Matching backend pagination parameter names and adjusting assertions/UX details to the actual app behavior.
