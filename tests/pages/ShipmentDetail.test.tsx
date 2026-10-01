import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listTrackedShipmentIds } from '../../src/lib/recentShipments';
import { ShipmentDetail } from '../../src/pages/ShipmentDetail';
import { jsonResponse, mockFetch, renderApp, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

describe('ShipmentDetail', () => {
  it('renders shipment details and tracks the id', async () => {
    mockFetch({ 'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()) });
    renderApp(<ShipmentDetail id="shp-1" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading shipment');
    expect(await screen.findByRole('heading', { name: 'Shipment KF-20261001-AB12' })).toBeInTheDocument();
    expect(screen.getByText('DEHAM → SGSIN')).toBeInTheDocument();
    expect(screen.getByText('20 Nov 2026')).toBeInTheDocument();
    expect(listTrackedShipmentIds()).toContain('shp-1');
  });

  it('shows a load error with retry', async () => {
    mockFetch({ 'GET /api/shipments/nope': () => jsonResponse({ detail: 'not found' }, 404) });
    renderApp(<ShipmentDetail id="nope" />);
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load that shipment");
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('reserves a pending shipment', async () => {
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'POST /api/shipments/shp-1/reserve': () => jsonResponse(shipmentWire({ status: 'RESERVED' })),
    });
    const user = userEvent.setup();
    renderApp(<ShipmentDetail id="shp-1" />);
    await user.click(await screen.findByRole('button', { name: 'Reserve shipment' }));
    expect(await screen.findByText('Reserved')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reserve shipment' })).not.toBeInTheDocument();
  });

  it("shows the reserve failure copy on a 409", async () => {
    mockFetch({
      'GET /api/shipments/shp-1': () => jsonResponse(shipmentWire()),
      'POST /api/shipments/shp-1/reserve': () => jsonResponse({ detail: 'carrier capacity exhausted' }, 409),
    });
    const user = userEvent.setup();
    renderApp(<ShipmentDetail id="shp-1" />);
    await user.click(await screen.findByRole('button', { name: 'Reserve shipment' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't reserve that shipment");
    expect(alert).toHaveTextContent('carrier capacity exhausted');
    expect(screen.getByRole('button', { name: 'Reserve shipment' })).toBeEnabled();
  });

  it('does not offer reservation for non-pending shipments', async () => {
    mockFetch({ 'GET /api/shipments/shp-3': () => jsonResponse(shipmentWire({ id: 'shp-3', status: 'IN_TRANSIT' })) });
    renderApp(<ShipmentDetail id="shp-3" />);
    expect(await screen.findByText('In Transit')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reserve shipment' })).not.toBeInTheDocument();
  });
});
