import { ApiError, extractDetail } from './errors';
import {
  createShipmentToWire,
  mapCarrier,
  mapQuote,
  mapShipment,
  quoteRequestToWire,
} from './mappers';
import type {
  Carrier,
  CreateShipmentRequest,
  Quote,
  QuoteRequest,
  Shipment,
} from './types';
import type { CarrierWire, QuoteWire, ShipmentWire } from './wire';

export const routes = {
  shipments: '/api/shipments',
  shipment: '/api/shipments/:id',
  reserve: '/api/shipments/:id/reserve',
  quote: '/api/quote',
  carriers: '/api/carriers',
} as const;

export type RouteName = keyof typeof routes;

export function buildPath(name: RouteName, params: Record<string, string> = {}): string {
  return routes[name].replace(/:([A-Za-z]+)/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path param "${key}" for route ${name}`);
    }
    return encodeURIComponent(value);
  });
}

function baseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
}

async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text === '') return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method: opts.method ?? 'GET',
    headers: { Accept: 'application/json' },
  };
  if (opts.signal) init.signal = opts.signal;
  if (opts.body !== undefined) {
    init.headers = { ...init.headers, 'Content-Type': 'application/json' };
    init.body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, init);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(0, 'Network request failed');
  }

  const body = await readBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed with status ${res.status}`, extractDetail(body));
  }
  return body as T;
}

export async function listCarriers(signal?: AbortSignal): Promise<Carrier[]> {
  const wire = await request<CarrierWire[]>(routes.carriers, signal ? { signal } : {});
  return wire.map(mapCarrier);
}

export async function createShipment(
  req: CreateShipmentRequest,
  signal?: AbortSignal,
): Promise<Shipment> {
  const opts: RequestOptions = { method: 'POST', body: createShipmentToWire(req) };
  if (signal) opts.signal = signal;
  const wire = await request<ShipmentWire>(routes.shipments, opts);
  return mapShipment(wire);
}

export async function getShipment(id: string, signal?: AbortSignal): Promise<Shipment> {
  const wire = await request<ShipmentWire>(buildPath('shipment', { id }), signal ? { signal } : {});
  return mapShipment(wire);
}

export async function reserveShipment(id: string, signal?: AbortSignal): Promise<Shipment> {
  const opts: RequestOptions = { method: 'POST' };
  if (signal) opts.signal = signal;
  const wire = await request<ShipmentWire>(buildPath('reserve', { id }), opts);
  return mapShipment(wire);
}

export async function requestQuote(req: QuoteRequest, signal?: AbortSignal): Promise<Quote> {
  const opts: RequestOptions = { method: 'POST', body: quoteRequestToWire(req) };
  if (signal) opts.signal = signal;
  const wire = await request<QuoteWire>(routes.quote, opts);
  return mapQuote(wire);
}
