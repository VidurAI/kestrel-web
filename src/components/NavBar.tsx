import type { ReactElement } from 'react';
import { Link } from '../lib/router';

const LINKS = [
  { to: '/', label: 'Shipments' },
  { to: '/book', label: 'Book' },
  { to: '/quote', label: 'Get a quote' },
] as const;

export function NavBar(): ReactElement {
  return (
    <header className="nav">
      <span className="nav__brand">Kestrel Freight</span>
      <nav aria-label="Primary" className="nav__links">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="nav__link">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
