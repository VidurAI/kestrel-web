import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCarriers } from '../../src/hooks/useCarriers';
import { carriersWire, jsonResponse, mockFetch } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('useCarriers', () => {
  it('loads carriers and filters active ones', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    const { result } = renderHook(() => useCarriers());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.carriers).toHaveLength(3);
    expect(result.current.activeCarriers.map((c) => c.code)).toEqual(['NSL', 'BLX']);
  });

  it('surfaces errors and recovers on reload', async () => {
    let calls = 0;
    mockFetch({
      'GET /api/carriers': () => {
        calls += 1;
        return calls === 1 ? jsonResponse({ detail: 'down' }, 503) : jsonResponse(carriersWire);
      },
    });
    const { result } = renderHook(() => useCarriers());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.carriers).toEqual([]);
    result.current.reload();
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.carriers).toHaveLength(3);
  });
});
