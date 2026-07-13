import { describe, expect, it, vi } from 'vitest';
import { sampleProductDetail } from '@/test/mocks/fixtures/catalog';
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  getDefaultOfferPrice,
  mapAvailability,
} from './json-ld';

describe('getDefaultOfferPrice', () => {
  it('returns basePrice when no variants exist', () => {
    expect(getDefaultOfferPrice(sampleProductDetail)).toBe(sampleProductDetail.basePrice);
  });

  it('returns the first variant price when variants exist', () => {
    const productWithVariants = {
      ...sampleProductDetail,
      basePrice: 500,
      variants: [
        { id: 'v1', sku: 'SKU-1', price: 750, stockQuantity: 10 },
        { id: 'v2', sku: 'SKU-2', price: 800, stockQuantity: 5 },
      ],
    };

    expect(getDefaultOfferPrice(productWithVariants)).toBe(750);
  });
});

describe('mapAvailability', () => {
  it('returns InStock when stock quantity is greater than zero', () => {
    expect(mapAvailability(5)).toBe('https://schema.org/InStock');
  });

  it('returns OutOfStock when stock quantity is zero', () => {
    expect(mapAvailability(0)).toBe('https://schema.org/OutOfStock');
  });
});

describe('buildProductJsonLd', () => {
  it('builds Product schema with THB offers matching getDefaultOfferPrice', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const jsonLd = buildProductJsonLd(sampleProductDetail, pageUrl);

    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe(sampleProductDetail.name);
    expect(jsonLd.offers).toMatchObject({
      priceCurrency: 'THB',
      price: getDefaultOfferPrice(sampleProductDetail),
    });
  });
});

describe('buildOrganizationJsonLd', () => {
  it('builds Organization schema from site config', () => {
    const config = { baseUrl: 'https://www.sopet.org', siteName: 'SOPET' };
    const jsonLd = buildOrganizationJsonLd(config);

    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.name).toBe('SOPET');
    expect(jsonLd.url).toBe('https://www.sopet.org');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('builds BreadcrumbList with absolute item URLs', () => {
    const items = [
      { name: 'หน้าแรก', url: 'https://www.sopet.org/' },
      { name: 'Dog Food', url: 'https://www.sopet.org/categories/dog-food' },
    ];

    const jsonLd = buildBreadcrumbJsonLd(items);

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(2);
    expect(jsonLd.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'หน้าแรก',
      item: 'https://www.sopet.org/',
    });
  });
});
