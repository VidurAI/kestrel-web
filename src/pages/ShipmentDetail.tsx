import { useEffect, type ReactElement } from 'react';
import { describeError } from '../api/errors';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { useReserveShipment } from '../hooks/useReserveShipment';
import { useShipment } from '../hooks/useShipment';
import { RESERVE_ERROR_COPY } from '../lib/copy';
import { formatEta, formatRoute } from '../lib/format';
import { trackShipment } from '../lib/recentShipments';
import { Link } from '../lib/router';

export function ShipmentDetail({ id }: { id: string }): ReactElement {
  const { shipment, status, error, reload } = useShipment(id);
  const { reserve, reserved, status: reserveStatus, error: reserveError, reset } = useReserveShipment();

  useEffect(() => {
    if (status === 'success') trackShipment(id);
  }, [status, id]);

  if (status === 'loading') return <LoadingSpinner label="Loading shipment" />;
  if (status === 'error' || shipment === null) {
    return <ErrorBanner message="We couldn't load that shipment" detail={describeError(error)} onRetry={reload} />;
  }

  const current = reserved ?? shipment;
  const reserving = reserveStatus === 'loading';

  return (
    <article className="card" aria-labelledby="shipment-title">
      <p>
        <Link to="/">&larr; All shipments</Link>
      </p>
      <h2 id="shipment-title">Shipment {current.reference}</h2>
      {reserveStatus === 'error' ? (
        <ErrorBanner message={RESERVE_ERROR_COPY} detail={describeError(reserveError)} onDismiss={reset} />
      ) : null}
      <dl className="details">
        <dt>Status</dt>
        <dd><StatusBadge status={current.status} /></dd>
        <dt>Route</dt>
        <dd>{formatRoute(current.origin, current.destination)}</dd>
        <dt>Carrier</dt>
        <dd>{current.carrierCode}</dd>
        <dt>ETA</dt>
        <dd>{formatEta(current.eta)}</dd>
      </dl>
      {current.status === 'PENDING' ? (
        <button type="button" className="btn btn--primary" disabled={reserving} onClick={() => void reserve(current.id)}>
          {reserving ? 'Reserving…' : 'Reserve shipment'}
        </button>
      ) : null}
    </article>
  );
}
