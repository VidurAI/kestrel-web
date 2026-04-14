import type { ReactElement } from 'react';

interface ErrorBannerProps {
  message: string;
  detail?: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, detail, onRetry, onDismiss }: ErrorBannerProps): ReactElement {
  return (
    <div className="banner banner--error" role="alert">
      <div className="banner__text">
        <strong>{message}</strong>
        {detail ? <p className="banner__detail">{detail}</p> : null}
      </div>
      <div className="banner__actions">
        {onRetry ? (
          <button type="button" className="btn btn--small" onClick={onRetry}>
            Try again
          </button>
        ) : null}
        {onDismiss ? (
          <button type="button" className="btn btn--small btn--ghost" onClick={onDismiss} aria-label="Dismiss">
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
