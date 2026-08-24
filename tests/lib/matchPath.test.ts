import { describe, expect, it } from 'vitest';
import { matchPath } from '../../src/lib/matchPath';

describe('matchPath', () => {
  it('matches static paths', () => {
    expect(matchPath('/book', '/book')).toEqual({ params: {} });
    expect(matchPath('/', '/')).toEqual({ params: {} });
  });

  it('extracts and decodes params', () => {
    expect(matchPath('/shipments/:id', '/shipments/a%20b')).toEqual({ params: { id: 'a b' } });
  });

  it('ignores query strings and trailing slashes', () => {
    expect(matchPath('/quote', '/quote/?x=1')).toEqual({ params: {} });
  });

  it('returns null on mismatch', () => {
    expect(matchPath('/shipments/:id', '/shipments')).toBeNull();
    expect(matchPath('/book', '/quote')).toBeNull();
    expect(matchPath('/a/:id', '/a/1/2')).toBeNull();
  });
});
