import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarrierSelect } from '../../src/components/CarrierSelect';

const carriers = [
  { code: 'NSL', name: 'NorthStar Lines', active: true },
  { code: 'BLX', name: 'Baltic Express', active: true },
  { code: 'PCR', name: 'Pacific Reach', active: false },
];

describe('CarrierSelect', () => {
  it('lists carriers with a placeholder', () => {
    render(<CarrierSelect id="c" carriers={carriers} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Select a carrier' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'NorthStar Lines (NSL)' })).toBeInTheDocument();
  });

  it('disables inactive carriers', () => {
    render(<CarrierSelect id="c" carriers={carriers} value="" onChange={() => {}} />);
    expect(screen.getByRole('option', { name: /Pacific Reach/ })).toBeDisabled();
  });

  it('reports the chosen code', () => {
    const onChange = vi.fn();
    render(<CarrierSelect id="c" carriers={carriers} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'BLX' } });
    expect(onChange).toHaveBeenCalledWith('BLX');
  });

  it('supports custom placeholder and invalid state', () => {
    render(<CarrierSelect id="c" carriers={carriers} value="" onChange={() => {}} placeholder="All carriers" invalid />);
    expect(screen.getByRole('option', { name: 'All carriers' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});
