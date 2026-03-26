import type { ReactElement } from 'react';
import { statusLabel } from '../lib/format';

const TONES: Record<string, string> = {
  PENDING: 'neutral',
  RESERVED: 'info',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export function StatusBadge({ status }: { status: string }): ReactElement {
  const tone = TONES[status] ?? 'neutral';
  return (
    <span className={`badge badge--${tone}`} data-testid="status-badge" data-status={status}>
      {statusLabel(status)}
    </span>
  );
}
