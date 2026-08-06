import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import type { CarrierWire, QuoteWire, ShipmentWire } from '../src/api/wire';
import { RouterProvider } from '../src/lib/router';

export const carriersWire: CarrierWire[] = [
  { code: 'NSL', name: 'NorthStar Lines', active: true },
  { code: 'BLX', name: 'Baltic Express', active: true },
  { code: 'PCR', name: 'Pacific Reach', active: false },
];

export function shipmentWire(overrides: Partial<ShipmentWire> = {}): ShipmentWire {
  return {
    id: 'shp-1',
    reference: 'KF-20261001-AB12',
    origin: 'DEHAM',
    destination: 'SGSIN',
    carrier_code: 'NSL',
    status: 'PENDING',
    eta: '2026-11-20T00:00:00Z',
    ...overrides,
  };
}

export function quoteWire(overrides: Partial<QuoteWire> = {}): QuoteWire {
  return {
    quote_id: 'q-100',
    amount: 1234.57,
    currency: 'EUR',
    breakdown: [
      { label: 'Base freight', amount: 1100 },
      { label: 'Fuel surcharge', amount: 134.57 },
    ],
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;

/** Installs a fetch mock keyed by "METHOD /path"; unknown routes fail the test loudly. */
export function mockFetch(handlers: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const key = `${init.method ?? 'GET'} ${url}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`Unhandled fetch: ${key}`);
    return handler(url, init);
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

export function renderApp(ui: ReactElement, path = '/') {
  window.history.replaceState(null, '', path);
  return render(<RouterProvider>{ui}</RouterProvider>);
}
