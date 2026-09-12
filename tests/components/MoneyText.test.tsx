import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoneyText } from '../../src/components/MoneyText';

describe('MoneyText', () => {
  it('formats amounts in the given currency', () => {
    render(<MoneyText amount={1234.5} currency="USD" />);
    expect(screen.getByText('$1,234.50')).toBeInTheDocument();
  });

  it('defaults to EUR and supports strong', () => {
    render(<MoneyText amount={10} strong />);
    const el = screen.getByText('€10.00');
    expect(el.tagName).toBe('STRONG');
  });

  it('marks negative amounts', () => {
    render(<MoneyText amount={-5} />);
    expect(screen.getByText(/5\.00/)).toHaveClass('money--negative');
  });
});
