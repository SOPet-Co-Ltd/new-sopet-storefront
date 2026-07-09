import { describe, expect, it } from 'vitest';
import {
  hasSearchFilters,
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
});
