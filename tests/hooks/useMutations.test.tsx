import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCreateShipment } from '../../src/hooks/useCreateShipment';
import { useMutation } from '../../src/hooks/useMutation';
import { useReserveShipment } from '../../src/hooks/useReserveShipment';
import { listTrackedShipmentIds } from '../../src/lib/recentShipments';
import { jsonResponse, mockFetch, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('useMutation', () => {
  it('captures results and errors without throwing', async () => {
    const { result } = renderHook(() =>
      useMutation(async (n: number) => {
        if (n < 0) throw new Error('negative');
        return n * 2;
      }),
    );
    let value: number | null = null;
    await act(async () => {
      value = await result.current.run(4);
    });
    expect(value).toBe(8);
    expect(result.current.status).toBe('success');
    await act(async () => {
      value = await result.current.run(-1);
    });
    expect(value).toBeNull();
    expect(result.current.status).toBe('error');
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
  });
});

describe('useCreateShipment', () => {
  it('creates and tracks the shipment', async () => {
    mockFetch({ 'POST /api/shipments': () => jsonResponse(shipmentWire({ id: 'new-1' }), 201) });
    const { result } = renderHook(() => useCreateShipment());
    await act(async () => {
      await result.current.create({ reference: 'KF-1', origin: 'DEHAM', destination: 'SGSIN', carrierCode: 'NSL' });
    });
    expect(result.current.created?.id).toBe('new-1');
    expect(listTrackedShipmentIds()).toEqual(['new-1']);
  });

  it('does not track on failure', async () => {
    mockFetch({ 'POST /api/shipments': () => jsonResponse({ detail: 'boom' }, 500) });
    const { result } = renderHook(() => useCreateShipment());
    await act(async () => {
      await result.current.create({ reference: 'KF-1', origin: 'DEHAM', destination: 'SGSIN', carrierCode: 'NSL' });
    });
    expect(result.current.status).toBe('error');
    expect(listTrackedShipmentIds()).toEqual([]);
  });
});

describe('useReserveShipment', () => {
  it('returns the reserved shipment', async () => {
    mockFetch({ 'POST /api/shipments/shp-1/reserve': () => jsonResponse(shipmentWire({ status: 'RESERVED' })) });
    const { result } = renderHook(() => useReserveShipment());
    await act(async () => {
      await result.current.reserve('shp-1');
    });
    expect(result.current.reserved?.status).toBe('RESERVED');
  });

  it('exposes a conflict as an error state', async () => {
    mockFetch({ 'POST /api/shipments/shp-1/reserve': () => jsonResponse({ detail: 'conflict' }, 409) });
    const { result } = renderHook(() => useReserveShipment());
    await act(async () => {
      await result.current.reserve('shp-1');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.reserved).toBeNull();
  });
});
