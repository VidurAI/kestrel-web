import { describe, expect, it } from 'vitest';
import { listTrackedShipmentIds, trackShipment, untrackShipment } from '../../src/lib/recentShipments';

describe('recentShipments', () => {
  it('starts empty', () => {
    expect(listTrackedShipmentIds()).toEqual([]);
  });

  it('tracks most recent first without duplicates', () => {
    trackShipment('a');
    trackShipment('b');
    trackShipment('a');
    expect(listTrackedShipmentIds()).toEqual(['a', 'b']);
  });

  it('caps the list at 25 entries', () => {
    for (let i = 0; i < 30; i += 1) trackShipment(`s${i}`);
    const ids = listTrackedShipmentIds();
    expect(ids).toHaveLength(25);
    expect(ids[0]).toBe('s29');
  });

  it('untracks and tolerates corrupt storage', () => {
    trackShipment('a');
    untrackShipment('a');
    expect(listTrackedShipmentIds()).toEqual([]);
    window.localStorage.setItem('kestrel.recentShipments', '{not json');
    expect(listTrackedShipmentIds()).toEqual([]);
  });
});
