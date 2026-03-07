import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { matchPath } from './matchPath';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }): ReactElement {
  const [path, setPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPop = (): void => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to);
    setPath(window.location.pathname);
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouterContext(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (ctx === null) throw new Error('Router hooks must be used inside <RouterProvider>');
  return ctx;
}

export function useNavigate(): (to: string) => void {
  return useRouterContext().navigate;
}

export function usePath(): string {
  return useRouterContext().path;
}

export interface RouteDef {
  path: string;
  render: (params: Record<string, string>) => ReactElement;
}

export function Routes({
  routes,
  fallback,
}: {
  routes: readonly RouteDef[];
  fallback: ReactElement;
}): ReactElement {
  const path = usePath();
  for (const route of routes) {
    const match = matchPath(route.path, path);
    if (match) return route.render(match.params);
  }
  return fallback;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps): ReactElement {
  const { navigate, path } = useRouterContext();
  const handle = (e: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(to);
  };
  const active = matchPath(to, path) !== null;
  return (
    <a href={to} onClick={handle} aria-current={active ? 'page' : undefined} {...rest}>
      {children}
    </a>
  );
}
