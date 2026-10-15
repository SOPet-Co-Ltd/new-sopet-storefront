import { createElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import {
  sampleProductDetail,
  sampleProductReview,
  sampleProductReviewWithReply,
} from '@/test/mocks/fixtures/catalog';
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  getDefaultOfferPrice,
  mapAvailability,
  PRODUCT_JSON_LD_REVIEW_LIMIT,
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

  // AC: Product JSON-LD price matches cheapest in-stock variant when variants exist
  // Behavior: Product with variants → getDefaultOfferPrice → cheapest in-stock price (not basePrice)
  // @category: core-functionality
  // @lane: unit
  // @dependency: inline variant fixture
  // ROI: 91 (BV:9 × Freq:9 + Legal:0 + Defect:8)
  it('returns the cheapest in-stock variant price when variants exist', () => {
    const productWithVariants = {
      ...sampleProductDetail,
      basePrice: 500,
      variants: [
        {
          id: 'v1',
          sku: 'SKU-1',
          price: 800,
          compareAtPrice: null,
          stockQuantity: 10,
          optionsJson: null,
        },
        {
          id: 'v2',
          sku: 'SKU-2',
          price: 750,
          compareAtPrice: null,
          stockQuantity: 5,
          optionsJson: null,
        },
        {
          id: 'v3',
          sku: 'SKU-3',
          price: 700,
          compareAtPrice: null,
          stockQuantity: 0,
          optionsJson: null,
        },
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
      seller: {
        '@type': 'Organization',
        name: sampleProductDetail.store.name,
        url: 'https://www.sopet.org/sellers/sopet-pet-shop',
      },
    });
    expect(jsonLd.brand).toEqual({
      '@type': 'Brand',
      name: 'Premium Pet',
    });
    expect(jsonLd.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: sampleProductDetail.averageRating,
      reviewCount: sampleProductDetail.reviewCount,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('includes up to four Review entries from the server review list', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const reviews = [
      sampleProductReview,
      sampleProductReviewWithReply,
      { ...sampleProductReview, id: 'review-3', rating: 4, comment: 'Good' },
      { ...sampleProductReview, id: 'review-4', rating: 3, comment: 'OK' },
      { ...sampleProductReview, id: 'review-5', rating: 5, comment: 'Extra' },
    ];
    const jsonLd = buildProductJsonLd(sampleProductDetail, pageUrl, reviews);
    const reviewEntries = jsonLd.review as Array<Record<string, unknown>>;

    expect(reviewEntries).toHaveLength(PRODUCT_JSON_LD_REVIEW_LIMIT);
    expect(reviewEntries[0]).toMatchObject({
      '@type': 'Review',
      author: { '@type': 'Person', name: sampleProductReview.customerName },
      datePublished: sampleProductReview.createdAt,
      reviewBody: sampleProductReview.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: sampleProductReview.rating,
        bestRating: 5,
        worstRating: 1,
      },
    });
  });

  it('omits aggregateRating and review when the product has no reviews', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const unreviewed = { ...sampleProductDetail, averageRating: 0, reviewCount: 0 };
    const jsonLd = buildProductJsonLd(unreviewed, pageUrl, []);

    expect(jsonLd.aggregateRating).toBeUndefined();
    expect(jsonLd.review).toBeUndefined();
  });

  it('omits offers when price is zero', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const freeProduct = { ...sampleProductDetail, basePrice: 0 };
    const jsonLd = buildProductJsonLd(freeProduct, pageUrl);

    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.offers).toBeUndefined();
  });

  it('resolves relative product image URLs to absolute URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const productWithRelativeImage = {
      ...sampleProductDetail,
      thumbnailUrl: '/images/dog-food.jpg',
      images: [
        {
          id: 'img-alt-1',
          imageUrl: '/images/dog-food-alt.jpg',
          isThumbnail: false,
          sortOrder: 1,
        },
      ],
    };
    const jsonLd = buildProductJsonLd(productWithRelativeImage, pageUrl);

    expect(jsonLd.image).toEqual([
      'https://www.sopet.org/images/dog-food.jpg',
      'https://www.sopet.org/images/dog-food-alt.jpg',
    ]);
  });

  it('uses the default variant SKU instead of the first variant', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const pageUrl = 'https://www.sopet.org/product/prod-001';
    const productWithVariants = {
      ...sampleProductDetail,
      variants: [
        {
          id: 'v1',
          sku: 'SKU-EXPENSIVE',
          price: 900,
          compareAtPrice: null,
          stockQuantity: 10,
          optionsJson: null,
        },
        {
          id: 'v2',
          sku: 'SKU-DEFAULT',
          price: 750,
          compareAtPrice: null,
          stockQuantity: 5,
          optionsJson: null,
        },
      ],
    };
    const jsonLd = buildProductJsonLd(productWithVariants, pageUrl);

    expect(jsonLd.sku).toBe('SKU-DEFAULT');
  });
});

describe('buildFaqJsonLd', () => {
  it('builds FAQPage schema from FAQ items', () => {
    const jsonLd = buildFaqJsonLd([
      { question: 'ของแท้ไหม', answer: 'ยาและสินค้าของเรามาจากรพ.ที่จดทะเบียนถูกต้อง' },
    ]);

    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'ของแท้ไหม',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ยาและสินค้าของเรามาจากรพ.ที่จดทะเบียนถูกต้อง',
        },
      },
    ]);
  });
});

describe('buildWebPageJsonLd', () => {
  it('builds WebPage schema for policy and regulatory pages', () => {
    const jsonLd = buildWebPageJsonLd({
      name: 'นโยบายความเป็นส่วนตัว',
      description: 'วิธีที่ Sopet เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ',
      url: 'https://www.sopet.org/policy/privacy-policy',
    });

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'นโยบายความเป็นส่วนตัว',
      description: 'วิธีที่ Sopet เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ',
      url: 'https://www.sopet.org/policy/privacy-policy',
    });
  });
});

describe('buildCollectionPageJsonLd', () => {
  it('builds CollectionPage schema for category listings', () => {
    const jsonLd = buildCollectionPageJsonLd({
      name: 'Dog Food',
      description: 'เลือกซื้อDog Foodจากร้านค้าที่ได้รับการอนุมัติบน Sopet',
      url: 'https://www.sopet.org/categories/dog-food',
    });

    expect(jsonLd['@type']).toBe('CollectionPage');
    expect(jsonLd.name).toBe('Dog Food');
    expect(jsonLd.url).toBe('https://www.sopet.org/categories/dog-food');
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

  it('neutralizes </script> payloads in product name within rendered script innerHTML', () => {
    const maliciousName = 'Evil Product</script><script>alert("xss")</script>';
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: maliciousName,
    };

    const { container } = render(createElement(JsonLdScript, { data: payload }));
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    expect(script?.innerHTML).not.toContain('</script>');
    expect(script?.innerHTML).toContain('\\u003c/script>');

    const parsed = JSON.parse(script?.innerHTML ?? '{}');
    expect(parsed.name).toBe(maliciousName);
  });
});
