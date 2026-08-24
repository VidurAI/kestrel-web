import { describe, expect, it } from 'vitest';
import { isMultiCarrierQuotesEnabled, parseFlag } from '../../src/lib/flags';

describe('parseFlag', () => {
  it.each(['1', 'true', 'TRUE', ' on ', 'yes', 'enabled'])('treats %j as on', (raw) => {
    expect(parseFlag(raw)).toBe(true);
  });

  it.each(['0', 'false', '', 'off', 'nope'])('treats %j as off', (raw) => {
    expect(parseFlag(raw)).toBe(false);
  });

  it('treats missing values as off', () => {
    expect(parseFlag(undefined)).toBe(false);
    expect(parseFlag(null)).toBe(false);
  });
});

describe('isMultiCarrierQuotesEnabled', () => {
  it('reads VITE_FEATURE_MULTI_CARRIER_QUOTES from the provided env', () => {
    expect(isMultiCarrierQuotesEnabled({ VITE_FEATURE_MULTI_CARRIER_QUOTES: 'true' })).toBe(true);
    expect(isMultiCarrierQuotesEnabled({ VITE_FEATURE_MULTI_CARRIER_QUOTES: 'false' })).toBe(false);
    expect(isMultiCarrierQuotesEnabled({})).toBe(false);
  });
});
