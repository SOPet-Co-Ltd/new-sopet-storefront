import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { sampleProductDetail } from '@/test/mocks/fixtures/catalog';
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
  getDefaultOfferPrice,
  mapAvailability,
} from './json-ld';

describe('getDefaultOfferPrice', () => {
  // AC: Product JSON-LD price matches basePrice when no variants (AC-012, AC-013)
  // Behavior: Product without variants → getDefaultOfferPrice → basePrice
  // @category: core-functionality
  // @lane: unit
  // @dependency: sampleProductDetail fixture
  // ROI: 92 (BV:9 × Freq:9 + Legal:0 + Defect:9)
  it('returns basePrice when no variants exist', () => {
    expect(getDefaultOfferPrice(sampleProductDetail)).toBe(sampleProductDetail.basePrice);
  });

  // AC: Product JSON-LD price matches first variant price when variants exist
  // Behavior: Product with variants → getDefaultOfferPrice → first variant price (not basePrice)
  // @category: core-functionality
  // @lane: unit
  // @dependency: inline variant fixture
  // ROI: 91 (BV:9 × Freq:9 + Legal:0 + Defect:8)
  it('returns the first variant price when variants exist', () => {
    const productWithVariants = {
      ...sampleProductDetail,
      basePrice: 500,
      variants: [
        { id: 'v1', sku: 'SKU-1', price: 750, stockQuantity: 10, optionsJson: null },
        { id: 'v2', sku: 'SKU-2', price: 800, stockQuantity: 5, optionsJson: null },
      ],
    };

    expect(getDefaultOfferPrice(productWithVariants)).toBe(750);
  });
});

describe('mapAvailability', () => {
  // AC: Product JSON-LD offers.availability reflects in-stock inventory
  // Behavior: stockQuantity > 0 → schema.org/InStock URL
  // @category: core-functionality
  // @lane: unit
  // @dependency: none
  // ROI: 70 (BV:7 × Freq:8 + Legal:0 + Defect:6)
  it('returns InStock when stock quantity is greater than zero', () => {
    expect(mapAvailability(5)).toBe('https://schema.org/InStock');
  });

  // AC: Product JSON-LD offers.availability reflects out-of-stock inventory
  // Behavior: stockQuantity === 0 → schema.org/OutOfStock URL
  // @category: core-functionality
  // @lane: unit
  // @dependency: none
  // ROI: 70 (BV:7 × Freq:8 + Legal:0 + Defect:6)
  it('returns OutOfStock when stock quantity is zero', () => {
    expect(mapAvailability(0)).toBe('https://schema.org/OutOfStock');
  });
});

describe('buildProductJsonLd', () => {
  // AC: Product JSON-LD includes THB currency and correct default price (AC-012, AC-013)
  // Behavior: buildProductJsonLd(fixture) → @type Product, name matches fixture, offers.priceCurrency THB, offers.price === getDefaultOfferPrice
  // @category: core-functionality
  // @lane: unit
  // @dependency: sampleProductDetail fixture, NEXT_PUBLIC_BASE_URL stub
  // ROI: 95 (BV:10 × Freq:9 + Legal:0 + Defect:9)
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
  // AC: Organization JSON-LD built from site config
  // Behavior: buildOrganizationJsonLd(config) → @type Organization with name and url
  // @category: core-functionality
  // @lane: unit
  // @dependency: inline site config
  // ROI: 65 (BV:6 × Freq:8 + Legal:0 + Defect:6)
  it('builds Organization schema from site config', () => {
    const config = { baseUrl: 'https://www.sopet.org', siteName: 'SOPET' };
    const jsonLd = buildOrganizationJsonLd(config);

    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd.name).toBe('SOPET');
    expect(jsonLd.url).toBe('https://www.sopet.org');
  });
});

describe('buildWebSiteJsonLd', () => {
  it('builds WebSite schema with SearchAction targeting site search', () => {
    const config = { baseUrl: 'https://www.sopet.org', siteName: 'SOPET' };
    const jsonLd = buildWebSiteJsonLd(config);
    const potentialAction = jsonLd.potentialAction as Record<string, unknown>;
    const target = potentialAction.target as Record<string, unknown>;

    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.name).toBe('SOPET');
    expect(jsonLd.url).toBe('https://www.sopet.org');
    expect(potentialAction['@type']).toBe('SearchAction');
    expect(target.urlTemplate).toBe('https://www.sopet.org/search?q={search_term_string}');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  // AC: BreadcrumbList JSON-LD uses absolute item URLs
  // Behavior: buildBreadcrumbJsonLd(items) → BreadcrumbList with position, name, item per entry
  // @category: core-functionality
  // @lane: unit
  // @dependency: inline breadcrumb items
  // ROI: 68 (BV:7 × Freq:8 + Legal:0 + Defect:6)
  it('builds BreadcrumbList with absolute item URLs', () => {
    const items = [
      { name: 'หน้าแรก', url: 'https://www.sopet.org/' },
      { name: 'Dog Food', url: 'https://www.sopet.org/categories/dog-food' },
    ];

    const jsonLd = buildBreadcrumbJsonLd(items);

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    const itemListElement = jsonLd.itemListElement as Array<Record<string, unknown>>;
    expect(itemListElement).toHaveLength(2);
    expect(itemListElement[0]).toMatchObject({
      position: 1,
      name: 'หน้าแรก',
      item: 'https://www.sopet.org/',
    });
  });
});

describe('JsonLdScript', () => {
  // AC: Product JSON-LD roundtrip — script content parses to offers matching getDefaultOfferPrice (AC-012, AC-013)
  // Behavior: buildProductJsonLd → JsonLdScript render → JSON.parse script innerHTML → offers.price and priceCurrency THB
  // @category: core-functionality
  // @lane: unit
  // @dependency: JsonLdScript, buildProductJsonLd, sampleProductDetail fixture
  // ROI: 94 (BV:10 × Freq:9 + Legal:0 + Defect:8)
  it('renders valid JSON-LD script for product payload', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const payload = buildProductJsonLd(sampleProductDetail, pageUrl);

    const { container } = render(createElement(JsonLdScript, { data: payload }));
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();

    const parsed = JSON.parse(script?.innerHTML ?? '{}');
    expect(parsed.offers.price).toBe(getDefaultOfferPrice(sampleProductDetail));
    expect(parsed.offers.priceCurrency).toBe('THB');
  });

  // AC: Null product produces no JSON-LD script (empty input failure mode)
  // Behavior: JsonLdScript data=null → no script element rendered
  // @category: core-functionality
  // @lane: unit
  // @dependency: JsonLdScript
  // ROI: 86 (BV:8 × Freq:9 + Legal:0 + Defect:8)
  it('renders nothing when data is null', () => {
    const { container } = render(createElement(JsonLdScript, { data: null }));

    expect(container.querySelector('script')).toBeNull();
  });

  // AC: Undefined payload produces no JSON-LD script (empty input failure mode)
  // Behavior: JsonLdScript data=undefined → no script element rendered
  // @category: core-functionality
  // @lane: unit
  // @dependency: JsonLdScript
  // ROI: 84 (BV:8 × Freq:8 + Legal:0 + Defect:8)
  it('renders nothing when data is undefined', () => {
    const { container } = render(createElement(JsonLdScript, { data: undefined }));

    expect(container.querySelector('script')).toBeNull();
  });

  // AC: Empty object payload produces no JSON-LD script (empty input failure mode)
  // Behavior: JsonLdScript data={} → no script element rendered
  // @category: core-functionality
  // @lane: unit
  // @dependency: JsonLdScript
  // ROI: 83 (BV:8 × Freq:8 + Legal:0 + Defect:7)
  it('renders nothing when data is an empty object', () => {
    const { container } = render(createElement(JsonLdScript, { data: {} }));

    expect(container.querySelector('script')).toBeNull();
  });

  // AC: Empty array payload produces no JSON-LD script (empty input failure mode)
  // Behavior: JsonLdScript data=[] → no script element rendered
  // @category: core-functionality
  // @lane: unit
  // @dependency: JsonLdScript
  // ROI: 83 (BV:8 × Freq:8 + Legal:0 + Defect:7)
  it('renders nothing when data is an empty array', () => {
    const { container } = render(createElement(JsonLdScript, { data: [] }));

    expect(container.querySelector('script')).toBeNull();
  });
});
