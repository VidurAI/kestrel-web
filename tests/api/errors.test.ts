import { describe, expect, it } from 'vitest';
import { ApiError, describeError, extractDetail, isApiError } from '../../src/api/errors';

describe('extractDetail', () => {
  it('reads string and list details', () => {
    expect(extractDetail({ detail: 'nope' })).toBe('nope');
    expect(extractDetail({ detail: [{ msg: 'a' }, { msg: 'b' }, { other: 1 }] })).toBe('a; b');
  });

  it('returns null for unusable bodies', () => {
    expect(extractDetail(null)).toBeNull();
    expect(extractDetail('text')).toBeNull();
    expect(extractDetail({ detail: [] })).toBeNull();
    expect(extractDetail({})).toBeNull();
  });
});

describe('describeError', () => {
  it('prefers API detail, with a friendly network message', () => {
    expect(describeError(new ApiError(409, 'Request failed', 'already reserved'))).toBe('already reserved');
    expect(describeError(new ApiError(500, 'Request failed with status 500'))).toBe('Request failed with status 500');
    expect(describeError(new ApiError(0, 'x'))).toMatch(/Network error/);
  });

  it('handles plain errors and unknown values', () => {
    expect(describeError(new Error('plain'))).toBe('plain');
    expect(describeError(42)).toBe('Something went wrong');
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
