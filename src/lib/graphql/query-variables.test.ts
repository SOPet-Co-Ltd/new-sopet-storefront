import { describe, expect, it } from 'vitest';
import {
  buildApprovedCategoriesVariables,
  buildProductByIdVariables,
  buildProductsListingVariables,
  buildRecommendedProductsVariables,
  buildSellerStorefrontVariables,
} from '@/lib/graphql/query-variables';

describe('query-variables', () => {
  it('buildProductsListingVariables matches useProducts variable shape', () => {
    expect(
      buildProductsListingVariables({
        category: 'dog-food',
        search: 'treats',
        storeId: 'store-1',
        tag: 'organic',
        page: 2,
        limit: 12,
        sortBy: 'soldCount',
        sortOrder: 'DESC',
      }),
    ).toEqual({
      category: 'dog-food',
      search: 'treats',
      storeId: 'store-1',
      tag: 'organic',
      page: 2,
      limit: 12,
      sortBy: 'soldCount',
      sortOrder: 'DESC',
    });
  });

  it('buildProductsListingVariables includes tag when omitted', () => {
    expect(buildProductsListingVariables({ category: 'cat-food' })).toEqual({
      category: 'cat-food',
      search: undefined,
      storeId: undefined,
      tag: undefined,
      page: 1,
      limit: 24,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('buildApprovedCategoriesVariables returns an empty variables object', () => {
    expect(buildApprovedCategoriesVariables()).toEqual({});
  });

  it('buildRecommendedProductsVariables defaults limit to 25', () => {
    expect(buildRecommendedProductsVariables()).toEqual({ limit: 25 });
  });

  it('buildProductByIdVariables maps id', () => {
    expect(buildProductByIdVariables({ id: 'prod-1' })).toEqual({ id: 'prod-1' });
  });

  it('buildSellerStorefrontVariables maps handle to slug', () => {
    expect(buildSellerStorefrontVariables({ handle: 'happy-pets' })).toEqual({
      slug: 'happy-pets',
    });
  });
});
