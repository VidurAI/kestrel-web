# kestrel-web

Booking console for Kestrel Freight. React 18 + TypeScript (strict) + Vite, tested with vitest and Testing Library. Owned by `@kestrel/web-team`.

The app only talks to the Kestrel gateway (`/api/*`); the gateway fans out to the booking and pricing services.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api to http://localhost:8080
npm test           # vitest run (jsdom)
npm run build      # tsc --noEmit + vite build
```

## Configuration

| Variable | Purpose |
|---|---|
| `VITE_FEATURE_MULTI_CARRIER_QUOTES` | `true` lets the quote page compare every active carrier at once. Off by default. |
| `VITE_API_BASE_URL` | Optional prefix for API calls (defaults to same origin). |

See `.env.example`.

## Layout

```
src/
  api/         types.ts (UI types), wire.ts (snake_case payloads), mappers.ts, client.ts, errors.ts
  lib/         money, validation, flags, formatting, tiny router, recent-shipment store
  hooks/       useShipments, useShipment, useQuote, useCarriers, mutations
  components/  CarrierSelect, StatusBadge, MoneyText, ErrorBanner, FormField, ...
  pages/       BookingForm, QuotePage, ShipmentList, ShipmentDetail, NotFound
tests/         mirrors src/; fetch is mocked per test (see tests/helpers.tsx)
```

## Gateway endpoints used

| Route | Used by |
|---|---|
| `POST /api/shipments` | BookingForm |
| `GET /api/shipments/:id` | ShipmentDetail, ShipmentList |
| `POST /api/shipments/:id/reserve` | ShipmentDetail |
| `POST /api/quote` | QuotePage |
| `GET /api/carriers` | BookingForm, QuotePage |

The wire format is snake_case; `src/api/mappers.ts` converts to the camelCase types in `src/api/types.ts`. The gateway has no list endpoint, so ShipmentList shows the shipments this browser has booked or opened (ids kept in `localStorage`) and loads each one by id.

## Conventions

- Files stay under 300 lines.
- Money is displayed through `formatMoney` / `MoneyText` (`src/lib/money.ts`).
- User-facing strings shared between components live in `src/lib/copy.ts`.
- Tests run against a mocked `fetch`; nothing hits the network.
