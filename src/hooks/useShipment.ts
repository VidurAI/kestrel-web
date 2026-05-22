import { getShipment } from '../api/client';
import type { Shipment } from '../api/types';
import { useAsyncData, type AsyncStatus } from './useAsyncData';

export interface UseShipment {
  shipment: Shipment | null;
  status: AsyncStatus;
  error: unknown;
  reload: () => void;
}

export function useShipment(id: string): UseShipment {
  const { data, status, error, reload } = useAsyncData((signal) => getShipment(id, signal), `shipment:${id}`);
  return { shipment: data, status, error, reload };
}
