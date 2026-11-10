import { describe, expect, it } from 'vitest';
import {
  buildProductHref,
  buildProductPathSegment,
  decodeProductPathParam,
  isLegacyProductId,
} from '@/lib/routing/productRoutes';

describe('productRoutes', () => {
  it('builds composite path segment from product and store slugs', () => {
    expect(buildProductPathSegment('premium-dog-food-5kg', 'sopet-pet-shop')).toBe(
      'premium-dog-food-5kg-sopet-pet-shop',
    );
  });

  it('builds Thai SEO href with Unicode by default (for redirects)', () => {
    expect(
      buildProductHref({
        slug: 'อาหารสุนัข',
        store: { slug: 'sopet-pet-shop' },
      }),
    ).toBe('/product/อาหารสุนัข-sopet-pet-shop');
  });

  it('encodes Thai SEO href when encode option is set (for Link/share)', () => {
    expect(
      buildProductHref(
        {
          slug: 'อาหารสุนัข',
          store: { slug: 'sopet-pet-shop' },
        },
        { encode: true },
      ),
    ).toBe(`/product/${encodeURIComponent('อาหารสุนัข-sopet-pet-shop')}`);
  });

  it('falls back to id when store slug is missing', () => {
    expect(buildProductHref({ slug: 'dog-food', id: 'prod-001' })).toBe('/product/prod-001');
  });

  it('detects legacy UUID product ids', () => {
    expect(isLegacyProductId('c880a541-d7d9-4566-a4a8-73c27e68d2e3')).toBe(true);
    expect(isLegacyProductId('premium-dog-food-5kg-sopet-pet-shop')).toBe(false);
    expect(isLegacyProductId('prod-001')).toBe(false);
  });

  it('decodes percent-encoded product path params', () => {
    const path = 'อาหารสุนัข-sopet-pet-shop';
    expect(decodeProductPathParam(encodeURIComponent(path))).toBe(path);
  });
});
