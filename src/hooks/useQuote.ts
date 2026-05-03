import { useCallback, useState } from 'react';
import { requestQuote } from '../api/client';
import type { Quote, QuoteRequest } from '../api/types';
import type { AsyncStatus } from './useAsyncData';

export interface CarrierQuote {
  carrierCode: string;
  quote: Quote | null;
  error: unknown;
}

export interface UseQuote {
  results: CarrierQuote[];
  status: AsyncStatus;
  error: unknown;
  /** Quote a single carrier (the one on the request). */
  fetchQuote: (req: QuoteRequest) => Promise<void>;
  /** Quote several carriers in parallel; failures are kept per carrier. */
  fetchQuotes: (req: Omit<QuoteRequest, 'carrierCode'>, carrierCodes: readonly string[]) => Promise<void>;
  reset: () => void;
}

export function useQuote(): UseQuote {
  const [results, setResults] = useState<CarrierQuote[]>([]);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [error, setError] = useState<unknown>(null);

  const fetchQuotes = useCallback(
    async (base: Omit<QuoteRequest, 'carrierCode'>, carrierCodes: readonly string[]) => {
      setStatus('loading');
      setError(null);
      const settled = await Promise.allSettled(
        carrierCodes.map((carrierCode) => requestQuote({ ...base, carrierCode })),
      );
      const next: CarrierQuote[] = settled.map((outcome, i) =>
        outcome.status === 'fulfilled'
          ? { carrierCode: carrierCodes[i]!, quote: outcome.value, error: null }
          : { carrierCode: carrierCodes[i]!, quote: null, error: outcome.reason as unknown },
      );
      setResults(next);
      if (next.every((r) => r.quote === null)) {
        setError(next[0]?.error ?? new Error('No quotes returned'));
        setStatus('error');
      } else {
        setStatus('success');
      }
    },
    [],
  );

  const fetchQuote = useCallback(
    (req: QuoteRequest) => {
      const { carrierCode, ...base } = req;
      return fetchQuotes(base, [carrierCode]);
    },
    [fetchQuotes],
  );

  const reset = useCallback(() => {
    setResults([]);
    setStatus('idle');
    setError(null);
  }, []);

  return { results, status, error, fetchQuote, fetchQuotes, reset };
}
