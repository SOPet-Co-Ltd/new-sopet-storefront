import { describe, expect, it } from 'vitest';
import {
  buildCategoryHref,
  decodeRouteParam,
  encodeRouteParam,
  resolveCategoryBySlug,
  resolveCategoryFilterName,
} from '@/lib/routing/categoryRoutes';

const SAMPLE_CATEGORIES = [
  { id: 'cat-1', name: 'อาหารสุนัข', slug: 'dog-food', imageUrl: null },
  { id: 'cat-2', name: 'ของเล่น', slug: 'ของเล่น', imageUrl: null },
];

describe('decodeRouteParam', () => {
  it('decodes percent-encoded Thai text', () => {
    expect(decodeRouteParam('%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99')).toBe(
      'ของเล่น',
    );
  });

  it('returns ASCII slugs unchanged', () => {
    expect(decodeRouteParam('dog-food')).toBe('dog-food');
  });

  it('returns invalid encodings unchanged', () => {
    expect(decodeRouteParam('%E0%B8%82%')).toBe('%E0%B8%82%');
  });
});

describe('encodeRouteParam', () => {
  it('encodes Thai text for URL segments', () => {
    expect(encodeRouteParam('ของเล่น')).toBe(
      '%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99',
    );
  });
});

describe('buildCategoryHref', () => {
  it('builds an encoded category path', () => {
    expect(buildCategoryHref('ของเล่น')).toBe(
      '/categories/%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99',
    );
  });
});

describe('resolveCategoryBySlug', () => {
  it('matches encoded Thai slugs to taxonomy entries', () => {
    const encodedSlug = encodeRouteParam('ของเล่น');

    expect(resolveCategoryBySlug(SAMPLE_CATEGORIES, encodedSlug)?.name).toBe('ของเล่น');
  });

  it('matches ASCII slugs to taxonomy entries', () => {
    expect(resolveCategoryBySlug(SAMPLE_CATEGORIES, 'dog-food')?.name).toBe('อาหารสุนัข');
  });
});

describe('resolveCategoryFilterName', () => {
  it('returns the category name for product filtering', () => {
    expect(resolveCategoryFilterName(SAMPLE_CATEGORIES, 'dog-food')).toBe('อาหารสุนัข');
  });

  it('decodes Thai slugs before falling back', () => {
    const encodedSlug = encodeRouteParam('ของเล่น');

    expect(resolveCategoryFilterName([], encodedSlug)).toBe('ของเล่น');
  });
});
