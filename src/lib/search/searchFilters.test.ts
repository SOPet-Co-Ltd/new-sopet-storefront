import { describe, expect, it } from 'vitest';
import {
  hasInvertedPriceParams,
  hasSearchFilters,
  isInvertedPriceRange,
  parseSearchFilters,
  toProductsFilterVariables,
} from '@/lib/search/searchFilters';

function createParams(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key] ?? null,
  };
}

describe('searchFilters', () => {
  it('parses comma-separated pet type and brand ids', () => {
    const filters = parseSearchFilters(
      createParams({
        petType: 'pet-cat, pet-dog',
        brand: 'brand-1',
      }),
    );

    expect(filters.petTypeIds).toEqual(['pet-cat', 'pet-dog']);
    expect(filters.brandIds).toEqual(['brand-1']);
    expect(hasSearchFilters(filters)).toBe(true);
  });

  it('parses active price bounds only when narrowed from defaults', () => {
    const filters = parseSearchFilters(
      createParams({
        minPrice: '506',
        maxPrice: '4109',
      }),
    );

    expect(filters.minPrice).toBe(506);
    expect(filters.maxPrice).toBe(4109);
    expect(toProductsFilterVariables(filters)).toEqual({
      petTypeIds: undefined,
      brandIds: undefined,
      minPrice: 506,
      maxPrice: 4109,
    });
  });

  it('returns inactive filters when params are absent', () => {
    const filters = parseSearchFilters(createParams({}));

    expect(hasSearchFilters(filters)).toBe(false);
    expect(toProductsFilterVariables(filters)).toEqual({
      petTypeIds: undefined,
      brandIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('drops inverted min/max so product queries never receive that pair', () => {
    const filters = parseSearchFilters(
      createParams({
        minPrice: '2000',
        maxPrice: '1000',
        petType: 'pet-dog',
      }),
    );

    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.petTypeIds).toEqual(['pet-dog']);
    expect(toProductsFilterVariables(filters)).toEqual({
      petTypeIds: ['pet-dog'],
      brandIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  });

  it('keeps a single price bound when the other param is absent', () => {
    expect(parseSearchFilters(createParams({ minPrice: '2000' })).minPrice).toBe(2000);
    expect(parseSearchFilters(createParams({ maxPrice: '1000' })).maxPrice).toBe(1000);
  });

  it('treats equal min and max as valid', () => {
    const filters = parseSearchFilters(
      createParams({
        minPrice: '500',
        maxPrice: '500',
      }),
    );

    expect(filters.minPrice).toBe(500);
    expect(filters.maxPrice).toBe(500);
  });
});

describe('isInvertedPriceRange', () => {
  it('is true only when min is strictly greater than max', () => {
    expect(isInvertedPriceRange(2000, 1000)).toBe(true);
    expect(isInvertedPriceRange(1000, 2000)).toBe(false);
    expect(isInvertedPriceRange(500, 500)).toBe(false);
  });
});

describe('hasInvertedPriceParams', () => {
  it('requires both params and an inverted clamped range', () => {
    expect(hasInvertedPriceParams(createParams({ minPrice: '2000', maxPrice: '1000' }))).toBe(true);
    expect(hasInvertedPriceParams(createParams({ minPrice: '2000' }))).toBe(false);
    expect(hasInvertedPriceParams(createParams({ minPrice: '100', maxPrice: '500' }))).toBe(false);
  });
});
