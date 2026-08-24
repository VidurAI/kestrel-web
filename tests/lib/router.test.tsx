import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Link, RouterProvider, Routes, useNavigate, type RouteDef } from '../../src/lib/router';

const routes: RouteDef[] = [
  { path: '/', render: () => <p>home page</p> },
  { path: '/things/:id', render: (p) => <p>thing {p.id}</p> },
];

function Harness() {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/">Home</Link>
      <Link to="/things/7">Seven</Link>
      <button onClick={() => navigate('/things/9')}>go nine</button>
      <Routes routes={routes} fallback={<p>missing</p>} />
    </>
  );
}

describe('router', () => {
  it('renders the matching route and fallback', () => {
    window.history.replaceState(null, '', '/nope');
    render(<RouterProvider><Harness /></RouterProvider>);
    expect(screen.getByText('missing')).toBeInTheDocument();
  });

  it('navigates when a link is clicked and updates history', () => {
    window.history.replaceState(null, '', '/');
    render(<RouterProvider><Harness /></RouterProvider>);
    fireEvent.click(screen.getByRole('link', { name: 'Seven' }));
    expect(screen.getByText('thing 7')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/things/7');
  });

  it('marks the active link with aria-current', () => {
    window.history.replaceState(null, '', '/');
    render(<RouterProvider><Harness /></RouterProvider>);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Seven' })).not.toHaveAttribute('aria-current');
  });

  it('supports programmatic navigation and popstate', () => {
    window.history.replaceState(null, '', '/');
    render(<RouterProvider><Harness /></RouterProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'go nine' }));
    expect(screen.getByText('thing 9')).toBeInTheDocument();
    window.history.replaceState(null, '', '/');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('throws when used outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Link to="/">x</Link>)).toThrow(/RouterProvider/);
  });
});
