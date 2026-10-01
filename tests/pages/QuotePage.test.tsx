import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuotePage } from '../../src/pages/QuotePage';
import { carriersWire, jsonResponse, mockFetch, quoteWire, renderApp } from '../helpers';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function fillBase(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Origin port'), 'DEHAM');
  await user.type(screen.getByLabelText('Destination port'), 'SGSIN');
  await user.type(screen.getByLabelText('Weight (kg)'), '250');
}

describe('QuotePage (single carrier)', () => {
  it('requires a carrier and a valid weight', async () => {
    mockFetch({ 'GET /api/carriers': () => jsonResponse(carriersWire) });
    const user = userEvent.setup();
    renderApp(<QuotePage />, '/quote');
    await screen.findByLabelText('Carrier');
    await user.type(screen.getByLabelText('Weight (kg)'), '0');
    await user.click(screen.getByRole('button', { name: 'Get quote' }));
    expect(screen.getByText('Weight must be greater than zero')).toBeInTheDocument();
    expect(screen.getByText('Choose a carrier')).toBeInTheDocument();
  });

  it('shows the quote breakdown after submit', async () => {
    const fetchMock = mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/quote': () => jsonResponse(quoteWire()),
    });
    const user = userEvent.setup();
    renderApp(<QuotePage />, '/quote');
    await screen.findByLabelText('Carrier');
    await fillBase(user);
    await user.selectOptions(screen.getByLabelText('Carrier'), 'NSL');
    await user.click(screen.getByRole('button', { name: 'Get quote' }));
    const card = await screen.findByRole('region', { name: 'Quote from NSL' });
    expect(within(card).getByText('Fuel surcharge')).toBeInTheDocument();
    expect(screen.getByText('Chargeable weight: 250 kg')).toBeInTheDocument();
    const quoteCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    expect(JSON.parse((quoteCall[1] as RequestInit).body as string)).toEqual({
      origin: 'DEHAM',
      destination: 'SGSIN',
      weight_kg: 250,
      carrier_code: 'NSL',
    });
  });

  it('shows the gateway error detail when pricing rejects the carrier', async () => {
    mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/quote': () => jsonResponse({ detail: 'unknown carrier code' }, 422),
    });
    const user = userEvent.setup();
    renderApp(<QuotePage />, '/quote');
    await screen.findByLabelText('Carrier');
    await fillBase(user);
    await user.selectOptions(screen.getByLabelText('Carrier'), 'BLX');
    await user.click(screen.getByRole('button', { name: 'Get quote' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts[0]).toHaveTextContent("We couldn't fetch a quote right now");
    expect(alerts[0]).toHaveTextContent('unknown carrier code');
  });
});

describe('QuotePage (VITE_FEATURE_MULTI_CARRIER_QUOTES on)', () => {
  it('compares all active carriers when none is selected and highlights the cheapest', async () => {
    vi.stubEnv('VITE_FEATURE_MULTI_CARRIER_QUOTES', 'true');
    mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/quote': (_u, init) => {
        const { carrier_code } = JSON.parse(init.body as string) as { carrier_code: string };
        return jsonResponse(quoteWire({ amount: carrier_code === 'BLX' ? 900 : 1500 }));
      },
    });
    const user = userEvent.setup();
    renderApp(<QuotePage />, '/quote');
    await screen.findByLabelText('Carrier');
    await fillBase(user);
    await user.click(screen.getByRole('button', { name: 'Compare quotes' }));
    const blx = await screen.findByRole('region', { name: 'Quote from BLX' });
    expect(within(blx).getByText('Best price')).toBeInTheDocument();
    const nsl = screen.getByRole('region', { name: 'Quote from NSL' });
    expect(within(nsl).queryByText('Best price')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Quote from PCR' })).not.toBeInTheDocument();
  });

  it('keeps successful quotes when one carrier fails', async () => {
    vi.stubEnv('VITE_FEATURE_MULTI_CARRIER_QUOTES', 'true');
    mockFetch({
      'GET /api/carriers': () => jsonResponse(carriersWire),
      'POST /api/quote': (_u, init) => {
        const { carrier_code } = JSON.parse(init.body as string) as { carrier_code: string };
        return carrier_code === 'NSL' ? jsonResponse({ detail: 'timeout' }, 504) : jsonResponse(quoteWire());
      },
    });
    const user = userEvent.setup();
    renderApp(<QuotePage />, '/quote');
    await screen.findByLabelText('Carrier');
    await fillBase(user);
    await user.click(screen.getByRole('button', { name: 'Compare quotes' }));
    const nsl = await screen.findByRole('region', { name: 'Quote from NSL' });
    expect(within(nsl).getByRole('alert')).toHaveTextContent('timeout');
    expect(screen.getByRole('region', { name: 'Quote from BLX' })).toBeInTheDocument();
  });
});
