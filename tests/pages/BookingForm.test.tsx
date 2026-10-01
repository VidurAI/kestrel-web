import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingForm } from '../../src/pages/BookingForm';
import { carriersWire, jsonResponse, mockFetch, renderApp, shipmentWire } from '../helpers';

afterEach(() => vi.unstubAllGlobals());

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Origin port'), 'deham');
  await user.type(screen.getByLabelText('Destination port'), 'SGSIN');
  await user.selectOptions(screen.getByLabelText('Carrier'), 'NSL');
}

describe('BookingForm', () => {
  it('shows a loading state, then the form', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    renderApp(<BookingForm />, '/book');
    expect(screen.getByRole('status')).toHaveTextContent('Loading carriers');
    expect(await screen.findByRole('form', { name: 'Book a shipment' })).toBeInTheDocument();
  });

  it('only offers active carriers', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    renderApp(<BookingForm />, '/book');
    await screen.findByLabelText('Carrier');
    expect(screen.queryByRole('option', { name: /Pacific Reach/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Baltic Express/ })).toBeInTheDocument();
  });

  it('shows carrier loading errors with a retry', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse({ detail: 'booking temporarily unavailable' }, 503) });
    renderApp(<BookingForm />, '/book');
    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load carriers");
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('validates fields and does not submit', async () => {
    const fetchMock = mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    const user = userEvent.setup();
    renderApp(<BookingForm />, '/book');
    await screen.findByLabelText('Carrier');
    await user.click(screen.getByRole('button', { name: 'Create booking' }));
    expect(screen.getByText('Origin is required')).toBeInTheDocument();
    expect(screen.getByText('Destination is required')).toBeInTheDocument();
    expect(screen.getByText('Choose a carrier')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('clears a field error once the user edits it', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    const user = userEvent.setup();
    renderApp(<BookingForm />, '/book');
    await screen.findByLabelText('Carrier');
    await user.click(screen.getByRole('button', { name: 'Create booking' }));
    await user.type(screen.getByLabelText('Origin port'), 'D');
    expect(screen.queryByText('Origin is required')).not.toBeInTheDocument();
  });

  it('submits a snake_case payload and navigates to the new shipment', async () => {
    const fetchMock = mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/shipments': () => jsonResponse(shipmentWire({ id: 'new-7' }), 201),
    });
    const user = userEvent.setup();
    renderApp(<BookingForm />, '/book');
    await screen.findByLabelText('Carrier');
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create booking' }));
    await waitFor(() => expect(window.location.pathname).toBe('/shipments/new-7'));
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    const body = JSON.parse((postCall[1] as RequestInit).body as string);
    expect(body).toMatchObject({ origin: 'DEHAM', destination: 'SGSIN', carrier_code: 'NSL' });
    expect(body.reference).toMatch(/^KF-\d{8}-[0-9A-Z]{4}$/);
  });

  it('shows the unavailable copy when booking returns 503', async () => {
    mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/shipments': () => jsonResponse({ detail: 'booking temporarily unavailable' }, 503),
    });
    const user = userEvent.setup();
    renderApp(<BookingForm />, '/book');
    await screen.findByLabelText('Carrier');
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Create booking' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Booking is temporarily unavailable');
    expect(window.location.pathname).toBe('/book');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
