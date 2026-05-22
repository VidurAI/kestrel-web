import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: unknown;
  status: AsyncStatus;
  reload: () => void;
}

/**
 * Runs `loader` on mount and whenever `key` changes. Stale responses are
 * dropped and the in-flight request is aborted on change/unmount.
 */
export function useAsyncData<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  key: string,
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError(null);
    loaderRef
      .current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, status, reload };
}
