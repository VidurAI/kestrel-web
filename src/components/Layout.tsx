import type { ReactElement, ReactNode } from 'react';
import { NavBar } from './NavBar';

export function Layout({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="shell">
      <NavBar />
      <main className="content">{children}</main>
      <footer className="footer">Kestrel Freight &middot; booking console</footer>
    </div>
  );
}
