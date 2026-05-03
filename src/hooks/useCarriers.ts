import { useMemo } from 'react';
import { listCarriers } from '../api/client';
import type { Carrier } from '../api/types';
import { useAsyncData, type AsyncStatus } from './useAsyncData';

export interface UseCarriers {
  carriers: Carrier[];
  activeCarriers: Carrier[];
  status: AsyncStatus;
  error: unknown;
  reload: () => void;
}

export function useCarriers(): UseCarriers {
  const { data, status, error, reload } = useAsyncData(listCarriers, 'carriers');
  const carriers = useMemo(() => data ?? [], [data]);
  const activeCarriers = useMemo(() => carriers.filter((c) => c.active), [carriers]);
  return { carriers, activeCarriers, status, error, reload };
}
