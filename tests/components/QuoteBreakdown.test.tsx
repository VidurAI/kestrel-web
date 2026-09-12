import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuoteBreakdown } from '../../src/components/QuoteBreakdown';
import { mapQuote } from '../../src/api/mappers';
import { quoteWire } from '../helpers';

describe('QuoteBreakdown', () => {
  it('lists each line and the total', () => {
    render(<QuoteBreakdown quote={mapQuote(quoteWire())} />);
    const table = screen.getByRole('table', { name: 'Quote breakdown' });
    expect(within(table).getByText('Base freight')).toBeInTheDocument();
    expect(within(table).getByText('€1,100.00')).toBeInTheDocument();
    expect(within(table).getByText('Fuel surcharge')).toBeInTheDocument();
    expect(within(table).getByText('€1,234.57')).toBeInTheDocument();
  });
});
