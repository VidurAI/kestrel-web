import type { ReactElement, ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps): ReactElement {
  return (
    <div className="empty">
      <h3 className="empty__title">{title}</h3>
      {children ? <div className="empty__body">{children}</div> : null}
    </div>
  );
}
