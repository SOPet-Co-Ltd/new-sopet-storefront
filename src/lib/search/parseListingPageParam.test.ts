import { describe, expect, it } from 'vitest';
import { parseListingPageParam } from './parseListingPageParam';

describe('parseListingPageParam', () => {
  it('defaults missing, empty, zero, negative, and non-integer values to 1', () => {
    expect(parseListingPageParam(undefined)).toBe(1);
    expect(parseListingPageParam(null)).toBe(1);
    expect(parseListingPageParam('')).toBe(1);
    expect(parseListingPageParam('0')).toBe(1);
    expect(parseListingPageParam('-1')).toBe(1);
    expect(parseListingPageParam('abc')).toBe(1);
    expect(parseListingPageParam('1.5')).toBe(1);
  });

  it('accepts positive integers', () => {
    expect(parseListingPageParam('1')).toBe(1);
    expect(parseListingPageParam('2')).toBe(2);
    expect(parseListingPageParam('999')).toBe(999);
  });
});
