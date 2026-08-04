import { describe, expect, it } from 'vitest';
import {
  PRODUCT_STATUS_PUBLISHED,
  STORE_STATUS_APPROVED,
  getCategoryIndexation,
  getSearchIndexation,
  isProductIndexable,
  isSellerIndexable,
} from './indexability';

const CATEGORY_SLUG = 'dog-food';

describe('getCategoryIndexation', () => {
  it('allows indexing for page 1 with no filters', () => {
    const result = getCategoryIndexation(CATEGORY_SLUG, {});

    expect(result).toEqual({
      indexable: true,
      robots: { index: true, follow: true },
      canonicalPath: '/categories/dog-food',
    });
  });

  it('allows indexing when page is explicitly 1', () => {
    const result = getCategoryIndexation(CATEGORY_SLUG, { page: '1' });

    expect(result.indexable).toBe(true);
    expect(result.robots).toEqual({ index: true, follow: true });
    expect(result.canonicalPath).toBe('/categories/dog-food');
  });

  it('sets noindex,follow for page > 1 with canonical to unfiltered page 1', () => {
    const result = getCategoryIndexation(CATEGORY_SLUG, { page: '2' });

    expect(result).toEqual({
      indexable: false,
      robots: { index: false, follow: true },
      canonicalPath: '/categories/dog-food',
    });
  });

  it.each(['petType', 'brand', 'tag', 'minPrice', 'maxPrice'] as const)(
    'sets noindex,follow when %s filter is present',
    (filterKey) => {
      const result = getCategoryIndexation(CATEGORY_SLUG, { [filterKey]: 'value' });

      expect(result.indexable).toBe(false);
      expect(result.robots).toEqual({ index: false, follow: true });
      expect(result.canonicalPath).toBe('/categories/dog-food');
    },
  );

  it('sets noindex,follow when multiple filters are combined', () => {
    const result = getCategoryIndexation(CATEGORY_SLUG, {
      petType: 'dog',
      brand: 'acme',
      page: '1',
    });

    expect(result.indexable).toBe(false);
    expect(result.robots).toEqual({ index: false, follow: true });
    expect(result.canonicalPath).toBe('/categories/dog-food');
  });
});

describe('getSearchIndexation', () => {
  it('always returns noindex,follow for bare search', () => {
    expect(getSearchIndexation()).toEqual({
      indexable: false,
      robots: { index: false, follow: true },
    });
  });
});

describe('isSellerIndexable', () => {
  it(`returns true when store status is ${STORE_STATUS_APPROVED}`, () => {
    expect(isSellerIndexable({ status: STORE_STATUS_APPROVED })).toBe(true);
  });

  it('returns false when store status is not approved', () => {
    expect(isSellerIndexable({ status: 'pending' })).toBe(false);
  });

  it('returns false for null or undefined store', () => {
    expect(isSellerIndexable(null)).toBe(false);
    expect(isSellerIndexable(undefined)).toBe(false);
  });
});

describe('isProductIndexable', () => {
  it(`returns true when product status is ${PRODUCT_STATUS_PUBLISHED}`, () => {
    expect(isProductIndexable({ status: PRODUCT_STATUS_PUBLISHED })).toBe(true);
  });

  it('returns false for unpublished or missing products', () => {
    expect(isProductIndexable({ status: 'draft' })).toBe(false);
    expect(isProductIndexable(null)).toBe(false);
    expect(isProductIndexable(undefined)).toBe(false);
  });
});
