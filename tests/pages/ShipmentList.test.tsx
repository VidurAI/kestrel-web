import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackShipment } from '../../src/lib/recentShipments';
import { ShipmentList } from '../../src/pages/ShipmentList';
import { jsonResponse, mockFetch, renderApp, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('ShipmentList', () => {
  it('shows an empty state when nothing is tracked', async () => {
    mockFetch({});
    renderApp(<ShipmentList />);
    expect(await screen.findByText('No shipments')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book a shipment' })).toHaveAttribute('href', '/book');
  });

  it('renders loading, then the table', async () => {
    trackShipment('shp-1');
    mockFetch({ 'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()) });
    renderApp(<ShipmentList />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading shipments');
    expect(await screen.findByRole('table', { name: 'Shipments' })).toBeInTheDocument();
    expect(screen.getByText('DEHAM → SGSIN')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    trackShipment('shp-2');
    trackShipment('shp-1');
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'GET /api/shipments/shp-2': () => jsonResponse(shipmentWire({ id: 'shp-2', reference: 'KF-TWO', status: 'DELIVERED' })),
    });
    const user = userEvent.setup();
    renderApp(<ShipmentList />);
    await screen.findByRole('table');
    await user.selectOptions(screen.getByLabelText('Status'), 'DELIVERED');
    expect(screen.getByText('KF-TWO')).toBeInTheDocument();
    expect(screen.queryByText('KF-20261001-AB12')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Status'), 'CANCELLED');
    expect(screen.getByText('Nothing matches this filter')).toBeInTheDocument();
  });

  it('reports shipments that failed to load', async () => {
    trackShipment('gone');
    trackShipment('shp-1');
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'GET /api/shipments/gone': () => jsonResponse({ detail: 'not found' }, 404),
    });
    renderApp(<ShipmentList />);
    expect(await screen.findByRole('alert')).toHaveTextContent('1 shipment could not be loaded');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
