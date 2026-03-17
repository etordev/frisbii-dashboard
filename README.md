# Frisbii Subscription Management Dashboard

Subscription management dashboard built with Angular v21 using the Frisbii API. It supports customer listing + search, customer detail (invoices/subscriptions), subscription lifecycle actions (pause/unpause), infinite scrolling, and toast notifications.

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

## Assumptions / notes

- **Pagination**: list endpoints return `next_page_token`. Requests send the token as both `page_token` and `next_page_token` to stay compatible with backend parameter naming.
- **Chunk sizes**:
  - Customers: initial chunk of 30
  - Invoices/subscriptions: 10 per request (infinite scroll)
- **No optimistic updates** for pause/unpause: action triggers a refresh after success.

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
