import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncStatus } from './useAsyncData';

export interface Mutation<A extends unknown[], R> {
  run: (...args: A) => Promise<R | null>;
  data: R | null;
  error: unknown;
  status: AsyncStatus;
  reset: () => void;
}

/** Imperative async action with loading/error state. `run` resolves null on failure. */
export function useMutation<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
): Mutation<A, R> {
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const mounted = useRef(true);
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (...args: A): Promise<R | null> => {
    setStatus('loading');
    setError(null);
    try {
      const result = await actionRef.current(...args);
      if (mounted.current) {
        setData(result);
        setStatus('success');
      }
      return result;
    } catch (err) {
      if (mounted.current) {
        setError(err);
        setStatus('error');
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus('idle');
  }, []);

  return { run, data, error, status, reset };
}
