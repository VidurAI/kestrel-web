import { reserveShipment } from '../api/client';
import type { Shipment } from '../api/types';
import { useMutation } from './useMutation';
import type { AsyncStatus } from './useAsyncData';

export interface UseReserveShipment {
  reserve: (id: string) => Promise<Shipment | null>;
  reserved: Shipment | null;
  status: AsyncStatus;
  error: unknown;
  reset: () => void;
}

export function useReserveShipment(): UseReserveShipment {
  const { run, data, status, error, reset } = useMutation((id: string) => reserveShipment(id));
  return { reserve: run, reserved: data, status, error, reset };
}
