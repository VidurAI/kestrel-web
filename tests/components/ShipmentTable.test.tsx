import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShipmentTable } from '../../src/components/ShipmentTable';
import { mapShipment } from '../../src/api/mappers';
import { renderApp, shipmentWire } from '../helpers';

describe('ShipmentTable', () => {
  it('renders one row per shipment with links to the detail page', () => {
    const shipments = [
      mapShipment(shipmentWire()),
      mapShipment(shipmentWire({ id: 'shp-2', reference: 'KF-TWO', status: 'DELIVERED', eta: null })),
    ];
    renderApp(<ShipmentTable shipments={shipments} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'KF-TWO' })).toHaveAttribute('href', '/shipments/shp-2');
    expect(screen.getByText('TBC')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });
});
