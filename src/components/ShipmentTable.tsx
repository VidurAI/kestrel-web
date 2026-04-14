import type { ReactElement } from 'react';
import type { Shipment } from '../api/types';
import { formatEta, formatRoute } from '../lib/format';
import { Link } from '../lib/router';
import { StatusBadge } from './StatusBadge';

export function ShipmentTable({ shipments }: { shipments: readonly Shipment[] }): ReactElement {
  return (
    <table className="table" aria-label="Shipments">
      <thead>
        <tr>
          <th scope="col">Reference</th>
          <th scope="col">Route</th>
          <th scope="col">Carrier</th>
          <th scope="col">Status</th>
          <th scope="col">ETA</th>
        </tr>
      </thead>
      <tbody>
        {shipments.map((s) => (
          <tr key={s.id}>
            <td>
              <Link to={`/shipments/${encodeURIComponent(s.id)}`}>{s.reference}</Link>
            </td>
            <td>{formatRoute(s.origin, s.destination)}</td>
            <td>{s.carrierCode}</td>
            <td>
              <StatusBadge status={s.status} />
            </td>
            <td>{formatEta(s.eta)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
