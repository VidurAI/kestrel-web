import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useShipments } from '../../src/hooks/useShipments';
import { useShipment } from '../../src/hooks/useShipment';
import { trackShipment } from '../../src/lib/recentShipments';
import { jsonResponse, mockFetch, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('useShipments', () => {
  it('returns an empty list when nothing is tracked', async () => {
    const fetchMock = mockFetch({});
    const { result } = renderHook(() => useShipments());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.shipments).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads tracked shipments and reports failures separately', async () => {
    trackShipment('missing');
    trackShipment('shp-2');
    trackShipment('shp-1');
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'GET /api/shipments/shp-2': () => jsonResponse(shipmentWire({ id: 'shp-2', status: 'RESERVED' })),
      'GET /api/shipments/missing': () => jsonResponse({ detail: 'not found' }, 404),
    });
    const { result } = renderHook(() => useShipments());
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.shipments.map((s) => s.id)).toEqual(['shp-1', 'shp-2']);
    expect(result.current.failedIds).toEqual(['missing']);
  });

  it('filters by status', async () => {
    trackShipment('shp-2');
    trackShipment('shp-1');
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'GET /api/shipments/shp-2': () => jsonResponse(shipmentWire({ id: 'shp-2', status: 'RESERVED' })),
    });
    const { result } = renderHook(() => useShipments());
    await waitFor(() => expect(result.current.status).toBe('success'));
    act(() => result.current.setStatusFilter('RESERVED'));
    expect(result.current.visible.map((s) => s.id)).toEqual(['shp-2']);
    act(() => result.current.setStatusFilter('ALL'));
    expect(result.current.visible).toHaveLength(2);
  });
});

describe('useShipment', () => {
  it('fetches a single shipment', async () => {
    mockFetch({ 'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()) });
    const { result } = renderHook(() => useShipment('shp-1'));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.shipment?.reference).toBe('KF-20261001-AB12');
  });

  it('refetches when the id changes', async () => {
    const fetchMock = mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'GET /api/shipments/shp-9': () => jsonResponse(shipmentWire({ id: 'shp-9', reference: 'KF-NINE' })),
    });
    const { result, rerender } = renderHook(({ id }) => useShipment(id), { initialProps: { id: 'shp-1' } });
    await waitFor(() => expect(result.current.status).toBe('success'));
    rerender({ id: 'shp-9' });
    await waitFor(() => expect(result.current.shipment?.reference).toBe('KF-NINE'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports errors', async () => {
    mockFetch({ 'GET /api/shipments/nope': () => jsonResponse({ detail: 'not found' }, 404) });
    const { result } = renderHook(() => useShipment('nope'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.shipment).toBeNull();
  });
});
