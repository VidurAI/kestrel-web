import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPath,
  createShipment,
  getShipment,
  listCarriers,
  requestQuote,
  reserveShipment,
  routes,
} from '../../src/api/client';
import { ApiError } from '../../src/api/errors';
import { carriersWire, jsonResponse, mockFetch, quoteWire, shipmentWire } from '../helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('routes', () => {
  it('exposes the gateway paths', () => {
    expect(routes.shipments).toBe('/api/shipments');
    expect(routes.shipment).toBe('/api/shipments/:id');
    expect(routes.reserve).toBe('/api/shipments/:id/reserve');
    expect(routes.quote).toBe('/api/quote');
    expect(routes.carriers).toBe('/api/carriers');
  });

  it('builds paths and encodes params', () => {
    expect(buildPath('shipment', { id: 'a/b' })).toBe('/api/shipments/a%2Fb');
    expect(buildPath('carriers')).toBe('/api/carriers');
  });

  it('throws when a param is missing', () => {
    expect(() => buildPath('reserve')).toThrow(/Missing path param "id"/);
  });
});

describe('typed wrappers', () => {
  it('lists carriers', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    const carriers = await listCarriers();
    expect(carriers.map((c) => c.code)).toEqual(['NSL', 'BLX', 'PCR']);
    expect(carriers[2]?.active).toBe(false);
  });

  it('creates a shipment with a snake_case body', async () => {
    const fetchMock = mockFetch({
      'POST /api/shipments': () => jsonResponse(shipmentWire(), 201),
    });
    const created = await createShipment({
      reference: 'KF-1',
      origin: 'DEHAM',
      destination: 'SGSIN',
      carrierCode: 'NSL',
    });
    expect(created.carrierCode).toBe('NSL');
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      reference: 'KF-1',
      origin: 'DEHAM',
      destination: 'SGSIN',
      carrier_code: 'NSL',
    });
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('gets and reserves a shipment', async () => {
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'POST /api/shipments/shp-1/reserve': () => jsonResponse(shipmentWire({ status: 'RESERVED' })),
    });
    expect((await getShipment('shp-1')).status).toBe('PENDING');
    expect((await reserveShipment('shp-1')).status).toBe('RESERVED');
  });

  it('requests a quote', async () => {
    const fetchMock = mockFetch({ 'POST /api/quote': () => jsonResponse(quoteWire()) });
    const quote = await requestQuote({ origin: 'DEHAM', destination: 'SGSIN', weightKg: 75, carrierCode: 'BLX' });
    expect(quote.quoteId).toBe('q-100');
    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.weight_kg).toBe(75);
    expect(body.carrier_code).toBe('BLX');
  });
});

describe('error handling', () => {
  it('throws ApiError with FastAPI detail', async () => {
    mockFetch({
      'POST /api/shipments/shp-1/reserve': () => jsonResponse({ detail: 'already reserved' }, 409),
    });
    const err = await reserveShipment('shp-1').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).isConflict).toBe(true);
    expect((err as ApiError).detail).toBe('already reserved');
  });

  it('flags 503 as unavailable and joins validation messages', async () => {
    mockFetch({
      'POST /api/quote': () =>
        jsonResponse({ detail: [{ msg: 'bad origin' }, { msg: 'bad weight' }] }, 422),
      'GET /api/carriers': () => jsonResponse({ detail: 'booking temporarily unavailable' }, 503),
    });
    const quoteErr = (await requestQuote({ origin: 'x', destination: 'y', weightKg: 1, carrierCode: 'NSL' }).catch(
      (e: unknown) => e,
    )) as ApiError;
    expect(quoteErr.isValidation).toBe(true);
    expect(quoteErr.detail).toBe('bad origin; bad weight');
    const carrierErr = (await listCarriers().catch((e: unknown) => e)) as ApiError;
    expect(carrierErr.isUnavailable).toBe(true);
  });

  it('wraps network failures as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('boom')));
    const err = (await listCarriers().catch((e: unknown) => e)) as ApiError;
    expect(err.isNetworkError).toBe(true);
  });

  it('handles empty and non-JSON error bodies', async () => {
    mockFetch({
      'GET /api/carriers': () => new Response('<html>bad gateway</html>', { status: 502 }),
    });
    const err = (await listCarriers().catch((e: unknown) => e)) as ApiError;
    expect(err.status).toBe(502);
    expect(err.detail).toBeNull();
  });
});
