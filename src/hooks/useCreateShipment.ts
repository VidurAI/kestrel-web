import { createShipment } from '../api/client';
import type { CreateShipmentRequest, Shipment } from '../api/types';
import { trackShipment } from '../lib/recentShipments';
import { useMutation } from './useMutation';
import type { AsyncStatus } from './useAsyncData';

export interface UseCreateShipment {
  create: (req: CreateShipmentRequest) => Promise<Shipment | null>;
  created: Shipment | null;
  status: AsyncStatus;
  error: unknown;
  reset: () => void;
}

export function useCreateShipment(): UseCreateShipment {
  const { run, data, status, error, reset } = useMutation(async (req: CreateShipmentRequest) => {
    const shipment = await createShipment(req);
    trackShipment(shipment.id);
    return shipment;
  });
  return { create: run, created: data, status, error, reset };
}
