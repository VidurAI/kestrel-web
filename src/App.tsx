import type { ReactElement } from 'react';
import { Layout } from './components/Layout';
import { BookingForm, NotFound, QuotePage, ShipmentDetail, ShipmentList } from './pages';
import { RouterProvider, Routes, type RouteDef } from './lib/router';

export const appRoutes: readonly RouteDef[] = [
  { path: '/', render: () => <ShipmentList /> },
  { path: '/book', render: () => <BookingForm /> },
  { path: '/quote', render: () => <QuotePage /> },
  { path: '/shipments/:id', render: (params) => <ShipmentDetail id={params.id ?? ''} /> },
];

export function App(): ReactElement {
  return (
    <RouterProvider>
      <Layout>
        <Routes routes={appRoutes} fallback={<NotFound />} />
      </Layout>
    </RouterProvider>
  );
}
