import type { ReactElement } from 'react';

export function LoadingSpinner({ label = 'Loading' }: { label?: string }): ReactElement {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__dot" aria-hidden="true" />
      <span>{label}&hellip;</span>
    </div>
  );
}
