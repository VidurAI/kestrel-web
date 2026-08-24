import { describe, expect, it } from 'vitest';
import { formatEta, formatRoute, formatWeight, statusLabel } from '../../src/lib/format';

describe('format helpers', () => {
  it('formats ETA dates in UTC', () => {
    expect(formatEta('2026-11-20T23:30:00Z')).toBe('20 Nov 2026');
  });

  it('shows TBC for missing or invalid ETA', () => {
    expect(formatEta(null)).toBe('TBC');
    expect(formatEta('')).toBe('TBC');
    expect(formatEta('garbage')).toBe('TBC');
  });

  it('formats routes and status labels', () => {
    expect(formatRoute('DEHAM', 'SGSIN')).toBe('DEHAM → SGSIN');
    expect(statusLabel('IN_TRANSIT')).toBe('In Transit');
  });

  it('formats weight', () => {
    expect(formatWeight(1250.55)).toBe('1,250.6 kg');
  });
});
