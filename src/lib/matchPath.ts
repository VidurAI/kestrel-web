export interface RouteMatch {
  params: Record<string, string>;
}

function segments(path: string): string[] {
  return path.split('?')[0]!.split('/').filter((s) => s !== '');
}

export function matchPath(pattern: string, path: string): RouteMatch | null {
  const want = segments(pattern);
  const have = segments(path);
  if (want.length !== have.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i += 1) {
    const w = want[i]!;
    const h = have[i]!;
    if (w.startsWith(':')) {
      params[w.slice(1)] = decodeURIComponent(h);
    } else if (w !== h) {
      return null;
    }
  }
  return { params };
}
