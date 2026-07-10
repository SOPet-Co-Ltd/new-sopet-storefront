import { describe, expect, it } from 'vitest';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';

describe('buildProductsListingVariables', () => {
  it('includes optional smart search variables when provided', () => {
    const sessionId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const variables = buildProductsListingVariables({
      search: 'cat food',
      sessionId,
      searchContext: {
        recentQueries: ['cat food'],
      },
    });

    expect(variables).toMatchObject({
      search: 'cat food',
      sessionId,
      searchContext: {
        recentQueries: ['cat food'],
      },
    });
  });
});
