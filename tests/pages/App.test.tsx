import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/App';
import { carriersWire, jsonResponse, mockFetch, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('App routing', () => {
  it('renders the shipment list at /', async () => {
    mockFetch({});
    window.history.replaceState(null, '', '/');
    render(<App />);
    expect(await screen.findByText('No shipments')).toBeInTheDocument();
  });

  it('navigates between pages through the nav bar', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    window.history.replaceState(null, '', '/');
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: 'Book' }));
    expect(await screen.findByRole('form', { name: 'Book a shipment' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Get a quote' }));
    expect(await screen.findByRole('form', { name: 'Request a quote' })).toBeInTheDocument();
  });

  it('renders the detail route with its id param', async () => {
    mockFetch({ 'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()) });
    window.history.replaceState(null, '', '/shipments/shp-1');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Shipment KF-/ })).toBeInTheDocument();
  });

  it('shows a not-found page for unknown routes', () => {
    window.history.replaceState(null, '', '/does-not-exist');
    render(<App />);
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
});
