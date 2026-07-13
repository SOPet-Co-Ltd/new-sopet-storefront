import { describe, expect, it } from 'vitest';
import {
  CATALOG_PRODUCT_ID,
  sampleCategories,
  sampleProductDetail,
  sampleStore,
} from '@/test/mocks/fixtures/catalog';
import {
  fetchAllSitemapProducts,
  fetchApprovedCategories,
  fetchApprovedStores,
  fetchProductById,
  fetchStoreBySlug,
} from './fetch';

describe('fetchProductById', () => {
  it.todo('returns product detail for a published product id');
  it.todo('returns null when product is not found');
});

describe('fetchApprovedCategories', () => {
  it.todo('returns approved categories from GraphQL');
});

describe('fetchStoreBySlug', () => {
  it.todo('returns store fields including status for a valid slug');
  it.todo('returns null when store is not found');
});

describe('fetchAllSitemapProducts', () => {
  it.todo('paginates products with limit 250 per request');
});

describe('fetchApprovedStores', () => {
  it.todo('returns only approved stores from GraphQL');
});

// Red-state import guard — ensures fetch module exports exist before task 03 implementation
describe('fetch module exports (red)', () => {
  it('exposes cached GraphQL loader functions', () => {
    expect(typeof fetchProductById).toBe('function');
    expect(typeof fetchApprovedCategories).toBe('function');
    expect(typeof fetchStoreBySlug).toBe('function');
    expect(typeof fetchAllSitemapProducts).toBe('function');
    expect(typeof fetchApprovedStores).toBe('function');
  });

  it('references fixture shapes expected by downstream SEO tests', () => {
    expect(sampleProductDetail.id).toBe(CATALOG_PRODUCT_ID);
    expect(sampleStore.status).toBe('approved');
    expect(sampleCategories.length).toBeGreaterThan(0);
  });
});
