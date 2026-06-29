import type { ChangeEvent, ReactElement } from 'react';
import type { ShipmentStatus } from '../api/types';
import { describeError } from '../api/errors';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ShipmentTable } from '../components/ShipmentTable';
import { useShipments } from '../hooks/useShipments';
import { EMPTY_SHIPMENTS_COPY } from '../lib/copy';
import { statusLabel } from '../lib/format';
import { Link } from '../lib/router';

const FILTERS: ReadonlyArray<ShipmentStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'RESERVED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
];

export function ShipmentList(): ReactElement {
  const { shipments, visible, failedIds, status, error, statusFilter, setStatusFilter, reload } = useShipments();

  if (status === 'loading') return <LoadingSpinner label="Loading shipments" />;
  if (status === 'error') {
    return <ErrorBanner message="We couldn't load your shipments" detail={describeError(error)} onRetry={reload} />;
  }

  if (shipments.length === 0 && failedIds.length === 0) {
    return (
      <EmptyState title="No shipments">
        <p>{EMPTY_SHIPMENTS_COPY}</p>
        <Link to="/book" className="btn btn--primary">Book a shipment</Link>
      </EmptyState>
    );
  }

  const onFilter = (e: ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value as ShipmentStatus | 'ALL');
  };

  return (
    <section aria-labelledby="shipments-title">
      <div className="toolbar">
        <h2 id="shipments-title">Shipments</h2>
        <label className="toolbar__filter">
          Status{' '}
          <select className="input" value={statusFilter} onChange={onFilter}>
            {FILTERS.map((f) => (
              <option key={f} value={f}>{f === 'ALL' ? 'All statuses' : statusLabel(f)}</option>
            ))}
          </select>
        </label>
      </div>
      {failedIds.length > 0 ? (
        <ErrorBanner
          message={`${failedIds.length} shipment${failedIds.length === 1 ? '' : 's'} could not be loaded`}
          onRetry={reload}
        />
      ) : null}
      {visible.length === 0 ? (
        <EmptyState title="Nothing matches this filter" />
      ) : (
        <ShipmentTable shipments={visible} />
      )}
    </section>
  );
}
