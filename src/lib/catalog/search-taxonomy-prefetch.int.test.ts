import { describe, expect, it } from 'vitest';
import { buildProductsListingCacheKey } from '@/lib/catalog/prefetchProductsListing';

describe('buildProductsListingCacheKey', () => {
  const baseVars = { category: 'dog-food', page: 1 };

  it('includes sessionId and searchContext when provided (AC-023)', () => {
    const anonymousKey = buildProductsListingCacheKey(baseVars);
    const sessionKey = buildProductsListingCacheKey({
      ...baseVars,
      sessionId: 'sess-1',
    });
    const contextKey = buildProductsListingCacheKey({
      ...baseVars,
      searchContext: { recentQueries: ['dog food'] },
    });

    expect(sessionKey).not.toBe(anonymousKey);
    expect(contextKey).not.toBe(anonymousKey);
    expect(sessionKey).not.toBe(contextKey);

    expect(JSON.parse(sessionKey).sessionId).toBe('sess-1');
    expect(JSON.parse(contextKey).searchContext).toEqual({ recentQueries: ['dog food'] });
  });

  it('produces distinct keys for different sessionId values', () => {
    const keyA = buildProductsListingCacheKey({ ...baseVars, sessionId: 'sess-a' });
    const keyB = buildProductsListingCacheKey({ ...baseVars, sessionId: 'sess-b' });

    expect(keyA).not.toBe(keyB);
  });

  it('produces distinct keys for different searchContext values', () => {
    const keyA = buildProductsListingCacheKey({
      ...baseVars,
      searchContext: { recentQueries: ['cat'] },
    });
    const keyB = buildProductsListingCacheKey({
      ...baseVars,
      searchContext: { recentQueries: ['dog'] },
    });

    expect(keyA).not.toBe(keyB);
  });

  it('dedupes identical full param objects', () => {
    const params = {
      ...baseVars,
      sessionId: 'sess-1',
      searchContext: { recentQueries: ['dog food'] },
    };

    expect(buildProductsListingCacheKey(params)).toBe(buildProductsListingCacheKey(params));
  });

  it('normalizes null and undefined session fields consistently', () => {
    const withNull = buildProductsListingCacheKey({
      ...baseVars,
      sessionId: null,
      searchContext: null,
    });
    const withUndefined = buildProductsListingCacheKey({
      ...baseVars,
      sessionId: undefined,
      searchContext: undefined,
    });

    expect(withNull).toBe(withUndefined);
    expect(JSON.parse(withNull).sessionId).toBeNull();
    expect(JSON.parse(withNull).searchContext).toBeNull();
  });
});
