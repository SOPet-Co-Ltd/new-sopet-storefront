import { describe, expect, it } from 'vitest';
import { parsePriceInput, SEARCH_FILTER_PRICE_MIN } from './SearchFilterPriceRange';

describe('parsePriceInput', () => {
  it('clamps a leading minus to 0 instead of stripping to a positive digit', () => {
    expect(parsePriceInput('-1')).toBe(SEARCH_FILTER_PRICE_MIN);
    expect(parsePriceInput('-')).toBe(SEARCH_FILTER_PRICE_MIN);
    expect(parsePriceInput(' -50 ')).toBe(SEARCH_FILTER_PRICE_MIN);
  });

  it('parses non-negative digit strings', () => {
    expect(parsePriceInput('100')).toBe(100);
    expect(parsePriceInput('1,000')).toBe(1000);
    expect(parsePriceInput('')).toBeNull();
  });
});
