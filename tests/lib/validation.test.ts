import { describe, expect, it } from 'vitest';
import {
  generateReference,
  hasErrors,
  validateBooking,
  validateLocode,
  validateQuote,
} from '../../src/lib/validation';

const goodBooking = { origin: 'DEHAM', destination: 'SGSIN', carrierCode: 'NSL', reference: '' };

describe('validateLocode', () => {
  it('requires a value', () => {
    expect(validateLocode('  ', 'Origin')).toBe('Origin is required');
  });

  it('accepts lower-case input', () => {
    expect(validateLocode('deham', 'Origin')).toBeUndefined();
  });

  it('rejects malformed codes', () => {
    expect(validateLocode('HAMBURG', 'Origin')).toMatch(/5-character UN\/LOCODE/);
  });
});

describe('validateBooking', () => {
  it('passes a valid booking', () => {
    expect(hasErrors(validateBooking(goodBooking))).toBe(false);
  });

  it('flags identical origin and destination', () => {
    const errors = validateBooking({ ...goodBooking, destination: 'deham' });
    expect(errors.destination).toBe('Destination must differ from origin');
  });

  it('requires a carrier', () => {
    expect(validateBooking({ ...goodBooking, carrierCode: '' }).carrierCode).toBe('Choose a carrier');
  });

  it('validates a custom reference but allows blank', () => {
    expect(validateBooking({ ...goodBooking, reference: 'x' }).reference).toBeDefined();
    expect(validateBooking({ ...goodBooking, reference: 'kf-2026-0001' }).reference).toBeUndefined();
  });
});

describe('validateQuote', () => {
  const good = { origin: 'DEHAM', destination: 'SGSIN', weightKg: '120', carrierCode: 'BLX' };

  it('passes valid input', () => {
    expect(hasErrors(validateQuote(good, { carrierRequired: true }))).toBe(false);
  });

  it('rejects zero, negative, empty and huge weights', () => {
    expect(validateQuote({ ...good, weightKg: '0' }, { carrierRequired: true }).weightKg).toMatch(/greater than zero/);
    expect(validateQuote({ ...good, weightKg: '-4' }, { carrierRequired: true }).weightKg).toMatch(/greater than zero/);
    expect(validateQuote({ ...good, weightKg: '' }, { carrierRequired: true }).weightKg).toBe('Weight is required');
    expect(validateQuote({ ...good, weightKg: '60000' }, { carrierRequired: true }).weightKg).toMatch(/cannot exceed/);
  });

  it('only requires a carrier when asked', () => {
    const noCarrier = { ...good, carrierCode: '' };
    expect(validateQuote(noCarrier, { carrierRequired: true }).carrierCode).toBeDefined();
    expect(validateQuote(noCarrier, { carrierRequired: false }).carrierCode).toBeUndefined();
  });
});

describe('generateReference', () => {
  it('is deterministic for a fixed clock and rng', () => {
    const ref = generateReference(new Date('2026-10-05T12:00:00Z'), () => 0.5);
    expect(ref).toMatch(/^KF-20261005-[0-9A-Z]{4}$/);
    expect(validateBooking({ ...goodBooking, reference: ref }).reference).toBeUndefined();
  });
});
