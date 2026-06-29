import type { ReactElement } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Link } from '../lib/router';

export function NotFound(): ReactElement {
  return (
    <EmptyState title="Page not found">
      <Link to="/">Back to shipments</Link>
    </EmptyState>
  );
}
