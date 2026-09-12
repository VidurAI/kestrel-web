import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBanner } from '../../src/components/ErrorBanner';

describe('ErrorBanner', () => {
  it('renders message and detail as an alert', () => {
    render(<ErrorBanner message="Bad thing" detail="because reasons" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bad thing');
    expect(screen.getByText('because reasons')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('wires retry and dismiss callbacks', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(<ErrorBanner message="x" onRetry={onRetry} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
