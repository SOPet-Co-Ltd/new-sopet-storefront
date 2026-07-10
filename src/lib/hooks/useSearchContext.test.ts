import { describe, expect, it } from 'vitest';
import { buildSearchContextInput } from '@/lib/hooks/useSearchContext';

describe('buildSearchContextInput', () => {
  it('truncates recent queries to 10 entries of 200 characters', () => {
    const longQuery = 'a'.repeat(250);
    const queries = Array.from({ length: 12 }, (_, index) => `query-${index}`);

    const context = buildSearchContextInput({
      recentQueries: [longQuery, ...queries],
      recentProductIds: [],
    });

    expect(context?.recentQueries).toHaveLength(10);
    expect(context?.recentQueries?.[0]).toHaveLength(200);
    expect(context?.recentProductIds).toBeUndefined();
  });

  it('filters invalid product ids and caps at 20', () => {
    const validId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const invalidIds = Array.from({ length: 25 }, () => 'not-a-uuid');

    const context = buildSearchContextInput({
      recentQueries: [],
      recentProductIds: [validId, ...invalidIds],
    });

    expect(context?.recentProductIds).toEqual([validId]);
  });
});
