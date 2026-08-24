import { describe, expect, it } from 'vitest';
import {
  createShipmentToWire,
  mapCarrier,
  mapQuote,
  mapShipment,
  quoteRequestToWire,
  toShipmentStatus,
} from '../../src/api/mappers';
import { quoteWire, shipmentWire } from '../helpers';

describe('mapShipment', () => {
  it('maps snake_case wire fields to camelCase', () => {
    expect(mapShipment(shipmentWire())).toEqual({
      id: 'shp-1',
      reference: 'KF-20261001-AB12',
      origin: 'DEHAM',
      destination: 'SGSIN',
      carrierCode: 'NSL',
      status: 'PENDING',
      eta: '2026-11-20T00:00:00Z',
    });
  });

  it('drops unknown wire fields', () => {
    const wire = { ...shipmentWire(), extra_field: 1 } as ReturnType<typeof shipmentWire>;
    expect(Object.keys(mapShipment(wire)).sort()).toEqual(
      ['carrierCode', 'destination', 'eta', 'id', 'origin', 'reference', 'status'],
    );
  });

  it('coerces numeric ids to strings and null eta stays null', () => {
    const mapped = mapShipment(shipmentWire({ id: 42 as unknown as string, eta: null }));
    expect(mapped.id).toBe('42');
    expect(mapped.eta).toBeNull();
  });
});

describe('toShipmentStatus', () => {
  it('normalises case and whitespace', () => {
    expect(toShipmentStatus(' reserved ')).toBe('RESERVED');
  });

  it('falls back to PENDING for unknown statuses', () => {
    expect(toShipmentStatus('LOST_AT_SEA')).toBe('PENDING');
  });
});

describe('mapQuote', () => {
  it('maps quote_id and breakdown', () => {
    const quote = mapQuote(quoteWire());
    expect(quote.quoteId).toBe('q-100');
    expect(quote.amount).toBe(1234.57);
    expect(quote.currency).toBe('EUR');
    expect(quote.breakdown).toEqual([
      { label: 'Base freight', amount: 1100 },
      { label: 'Fuel surcharge', amount: 134.57 },
    ]);
  });

  it('tolerates a missing breakdown', () => {
    const wire = { ...quoteWire(), breakdown: undefined } as unknown as ReturnType<typeof quoteWire>;
    expect(mapQuote(wire).breakdown).toEqual([]);
  });
});

describe('request mappers', () => {
  it('converts quote requests to snake_case', () => {
    expect(
      quoteRequestToWire({ origin: 'DEHAM', destination: 'SGSIN', weightKg: 80, carrierCode: 'BLX' }),
    ).toEqual({ origin: 'DEHAM', destination: 'SGSIN', weight_kg: 80, carrier_code: 'BLX' });
  });

  it('converts create-shipment requests to snake_case', () => {
    expect(
      createShipmentToWire({ reference: 'KF-1', origin: 'A', destination: 'B', carrierCode: 'PCR' }),
    ).toEqual({ reference: 'KF-1', origin: 'A', destination: 'B', carrier_code: 'PCR' });
  });
});

describe('mapCarrier', () => {
  it('defaults active to true', () => {
    expect(mapCarrier({ code: 'NSL', name: 'NorthStar Lines' })).toEqual({
      code: 'NSL',
      name: 'NorthStar Lines',
      active: true,
    });
  });
});
