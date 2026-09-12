import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Layout } from '../../src/components/Layout';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { renderApp } from '../helpers';

describe('Layout and small components', () => {
  it('renders navigation and content', () => {
    renderApp(<Layout><p>inside</p></Layout>, '/book');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav).toHaveTextContent('Shipments');
    expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('inside')).toBeInTheDocument();
  });

  it('renders EmptyState with optional body', () => {
    renderApp(<EmptyState title="Nothing">body text</EmptyState>);
    expect(screen.getByRole('heading', { name: 'Nothing' })).toBeInTheDocument();
    expect(screen.getByText('body text')).toBeInTheDocument();
  });

  it('renders an accessible loading status', () => {
    renderApp(<LoadingSpinner label="Loading things" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading things');
  });
});
