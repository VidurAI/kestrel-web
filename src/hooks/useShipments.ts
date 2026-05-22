import { useMemo, useState } from 'react';
import { getShipment } from '../api/client';
import type { Shipment, ShipmentStatus } from '../api/types';
import { listTrackedShipmentIds } from '../lib/recentShipments';
import { useAsyncData, type AsyncStatus } from './useAsyncData';

interface Loaded {
  shipments: Shipment[];
  failedIds: string[];
}

async function loadTracked(ids: readonly string[], signal: AbortSignal): Promise<Loaded> {
  const results = await Promise.allSettled(ids.map((id) => getShipment(id, signal)));
  const shipments: Shipment[] = [];
  const failedIds: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') shipments.push(result.value);
    else failedIds.push(ids[index]!);
  });
  return { shipments, failedIds };
}

export interface UseShipments {
  shipments: Shipment[];
  visible: Shipment[];
  failedIds: string[];
  status: AsyncStatus;
  error: unknown;
  statusFilter: ShipmentStatus | 'ALL';
  setStatusFilter: (next: ShipmentStatus | 'ALL') => void;
  reload: () => void;
}

/**
 * The gateway has no list endpoint, so the list is made of the shipments this
 * browser has booked or opened, each fetched through GET /api/shipments/:id.
 */
export function useShipments(): UseShipments {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL');
  const ids = listTrackedShipmentIds();
  const { data, status, error, reload } = useAsyncData(
    (signal) => loadTracked(ids, signal),
    `shipments:${ids.join(',')}`,
  );
  const shipments = useMemo(() => data?.shipments ?? [], [data]);
  const failedIds = useMemo(() => data?.failedIds ?? [], [data]);
  const visible = useMemo(
    () => (statusFilter === 'ALL' ? shipments : shipments.filter((s) => s.status === statusFilter)),
    [shipments, statusFilter],
  );
  return { shipments, visible, failedIds, status, error, statusFilter, setStatusFilter, reload };
}
