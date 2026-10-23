import { describe, expect, it } from 'vitest';
import { resolveListingTotal, resolveListingTotalPages } from './resolveListingPagination';

describe('resolveListingTotal', () => {
  it('uses SSR initialTotal while client pagination is missing', () => {
    expect(
      resolveListingTotal({
        hasPagination: false,
        useInitialProducts: true,
        fetchedTotal: 0,
        initialTotal: 11,
      }),
    ).toBe(11);
  });

  it('prefers client total once pagination arrives', () => {
    expect(
      resolveListingTotal({
        hasPagination: true,
        useInitialProducts: true,
        fetchedTotal: 11,
        initialTotal: 11,
      }),
    ).toBe(11);
  });
});

describe('resolveListingTotalPages', () => {
  it('uses SSR initialTotalPages while client pagination is missing', () => {
    expect(
      resolveListingTotalPages({
        hasPagination: false,
        useInitialProducts: true,
        fetchedTotalPages: 0,
        initialTotalPages: 2,
      }),
    ).toBe(2);
  });
});
