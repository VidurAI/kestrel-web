import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useQuote } from '../../src/hooks/useQuote';
import { jsonResponse, mockFetch, quoteWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

const base = { origin: 'DEHAM', destination: 'SGSIN', weightKg: 100 };

describe('useQuote', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useQuote());
    expect(result.current.status).toBe('idle');
    expect(result.current.results).toEqual([]);
  });

  it('fetches a single quote', async () => {
    mockFetch({ 'POST /api/quote': () => jsonResponse(quoteWire()) });
    const { result } = renderHook(() => useQuote());
    await act(() => result.current.fetchQuote({ ...base, carrierCode: 'NSL' }));
    expect(result.current.status).toBe('success');
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]?.quote?.quoteId).toBe('q-100');
  });

  it('keeps partial results when some carriers fail', async () => {
    mockFetch({
      'POST /api/quote': (_url, init) => {
        const body = JSON.parse(init.body as string) as { carrier_code: string };
        return body.carrier_code === 'BLX'
          ? jsonResponse({ detail: 'unknown carrier code' }, 422)
          : jsonResponse(quoteWire({ quote_id: `q-${body.carrier_code}` }));
      },
    });
    const { result } = renderHook(() => useQuote());
    await act(() => result.current.fetchQuotes(base, ['NSL', 'BLX']));
    expect(result.current.status).toBe('success');
    expect(result.current.results.map((r) => [r.carrierCode, r.quote?.quoteId ?? null])).toEqual([
      ['NSL', 'q-NSL'],
      ['BLX', null],
    ]);
  });

  it('errors when every carrier fails, then resets', async () => {
    mockFetch({ 'POST /api/quote': () => jsonResponse({ detail: 'boom' }, 500) });
    const { result } = renderHook(() => useQuote());
    await act(() => result.current.fetchQuotes(base, ['NSL', 'BLX']));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeTruthy();
    act(() => result.current.reset());
    expect(result.current.status).toBe('idle');
    expect(result.current.results).toEqual([]);
  });
});
