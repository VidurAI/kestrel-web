import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '../../src/components/StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['PENDING', 'Pending', 'badge--neutral'],
    ['RESERVED', 'Reserved', 'badge--info'],
    ['IN_TRANSIT', 'In Transit', 'badge--info'],
    ['DELIVERED', 'Delivered', 'badge--success'],
    ['CANCELLED', 'Cancelled', 'badge--danger'],
  ])('renders %s', (status, label, cls) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveClass(cls);
    expect(badge).toHaveAttribute('data-status', status);
  });

  it('falls back to a neutral tone for unknown statuses', () => {
    render(<StatusBadge status="WEIRD" />);
    expect(screen.getByTestId('status-badge')).toHaveClass('badge--neutral');
  });
});
