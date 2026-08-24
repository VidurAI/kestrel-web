import { describe, expect, it } from 'vitest';
import { formatMoney, parseMoneyInput, roundMoney, sumMoney } from '../../src/lib/money';

describe('roundMoney', () => {
  it('rounds to two decimals', () => {
    expect(roundMoney(10.126)).toBe(10.13);
    expect(roundMoney(10.124)).toBe(10.12);
  });

  it('leaves whole and already-rounded values alone', () => {
    expect(roundMoney(0)).toBe(0);
    expect(roundMoney(42)).toBe(42);
    expect(roundMoney(19.99)).toBe(19.99);
  });

  it('handles negative amounts', () => {
    expect(roundMoney(-1.234)).toBe(-1.23);
  });

  it('rounds exact halves upward for positive values', () => {
    expect(roundMoney(0.5)).toBe(0.5);
    expect(roundMoney(2.25)).toBe(2.25);
  });
});

describe('formatMoney', () => {
  it('formats EUR with two decimals', () => {
    expect(formatMoney(1234.5, 'EUR')).toBe('€1,234.50');
  });

  it('rounds before formatting', () => {
    expect(formatMoney(9.999, 'USD')).toBe('$10.00');
  });

  it('falls back for invalid currency codes', () => {
    expect(formatMoney(5, 'not-a-code')).toBe('5.00 not-a-code');
  });
});

describe('sumMoney', () => {
  it('sums and rounds', () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([])).toBe(0);
  });
});

describe('parseMoneyInput', () => {
  it('parses plain and comma-grouped numbers', () => {
    expect(parseMoneyInput('1,234.50')).toBe(1234.5);
    expect(parseMoneyInput(' 12 ')).toBe(12);
  });

  it('returns null for junk', () => {
    expect(parseMoneyInput('')).toBeNull();
    expect(parseMoneyInput('12abc')).toBeNull();
  });
});
