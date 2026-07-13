// Storefront SEO / AEO / GEO integration Test - Design Doc: storefront-seo-aeo-geo-frontend-design.md
// Generated: 2026-07-13 | Budget Used: 3/3 integration, 0/3 fixture-e2e, 0/2 service-e2e
//
// -----------------------------------------------------------------------------
// Integration test 1 of 3
// -----------------------------------------------------------------------------
//
// AC1: "When a valid published product ID is requested, the system shall render <title>, description, canonical, Open Graph, and twitter:card tags from server generateMetadata before client hydration (AC-004, AC-023 P2)"
// AC2: "When a published product page renders, the system shall include Product JSON-LD with offers.price in THB matching the default variant / basePrice shown on initial server render (AC-012, AC-013)"
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9)
// Behavior: MSW returns published product fixture → buildProductMetadata + buildProductJsonLd → canonical/title/OG/twitter + JSON-LD offers.priceCurrency THB and offers.price equals getDefaultOfferPrice(fixture)
// @category: core-functionality
// @lane: integration
// @dependency: buildProductMetadata, buildProductJsonLd, getDefaultOfferPrice, truncateDescription, MSW ProductById fixture
// @complexity: high
// Primary failure mode: metadata title/OG omit product name or JSON-LD offers.price diverges from fixture basePrice/default variant price shown on SSR
// Proof obligation: with NEXT_PUBLIC_BASE_URL=https://www.sopet.org mocked, assert buildProductMetadata(sampleProductDetail) emits alternates.canonical https://www.sopet.org/product/{uuid} (no trailing slash on origin), title contains product.name, openGraph.images uses absolute thumbnailUrl, twitter card present; buildProductJsonLd returns @type Product with offers.price === fixture basePrice (or first variant price when variants exist) and offers.priceCurrency === 'THB'; GraphQL boundary mocked via MSW only
// Verification points / expected results / pass criteria:
// - Canonical URL is absolute and uses configured BASE_URL + /product/{id}
// - Metadata title includes sampleProductDetail.name
// - openGraph.url matches canonical
// - twitter:card (or equivalent Metadata.twitter) is summary_large_image when P2 wired
// - JSON-LD offers.price equals getDefaultOfferPrice(sampleProductDetail) independently computed from fixture
// - JSON-LD offers.priceCurrency is literal 'THB'
// - robots.index is true for published product fixture
//
// -----------------------------------------------------------------------------
// Integration test 2 of 3
// -----------------------------------------------------------------------------
//
// AC1: "When NEXT_PUBLIC_BASE_URL=https://www.sopet.org is set, the system shall emit canonical and OG URLs using that origin without a trailing slash"
// AC2: "When SEO env vars are unset in local dev, the system shall fall back to http://localhost:3000 and Sopet without throwing"
// AC3: "When NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION is set, the system shall include google-site-verification in root metadata"
// ROI: 98 (BV:9 × Freq:10 + Legal:0 + Defect:8)
// Behavior: Override process.env per case → getSiteConfig + buildPageMetadata/buildAbsoluteUrl → absolute URLs and safe defaults without throw
// @category: core-functionality
// @lane: integration
// @dependency: getSiteConfig, buildPageMetadata, buildAbsoluteUrl
// @complexity: medium
// Primary failure mode: trailing slash on base URL propagates to canonicals, or unset env throws / yields wrong host in production-like paths
// Proof obligation: three env branches — (A) BASE_URL with trailing slash stripped in output, (B) all SEO env unset returns baseUrl http://localhost:3000 and siteName Sopet without exception, (C) verification token surfaces in metadata shape consumed by root layout; mock process.env only at boundary, use real builder functions
// Verification points / expected results / pass criteria:
// - buildAbsoluteUrl('/categories/dog-food') === 'https://www.sopet.org/categories/dog-food' when BASE_URL=https://www.sopet.org/
// - getSiteConfig().baseUrl has no trailing slash
// - Unset env: getSiteConfig() returns localhost:3000 and Sopet
// - buildPageMetadata never throws on minimal input
// - When NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION set, exported root metadata helper exposes verification.google token
//
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildRootMetadata } from '@/app/layout';
import { buildAbsoluteUrl, buildPageMetadata, getSiteConfig } from './metadata';

vi.mock('next/font/google', () => ({
  Mitr: () => ({
    variable: '--font-mitr',
    className: 'mitr-class',
  }),
}));

vi.mock('@/lib/providers', () => ({
  AppProviders: ({ children }: { children: ReactNode }) => children,
}));

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('integration test 2 of 3 — site config and root metadata env branches', () => {
  describe('branch A — BASE_URL trailing slash stripped', () => {
    it('strips trailing slash from configured base URL', () => {
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org/');

      expect(getSiteConfig().baseUrl).toBe('https://www.sopet.org');
      expect(buildAbsoluteUrl('/categories/dog-food')).toBe(
        'https://www.sopet.org/categories/dog-food',
      );
    });

    it('emits canonical and OG URLs without trailing slash on origin', () => {
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org/');
      vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'SOPET');

      const pageMetadata = buildPageMetadata({
        title: 'Dog Food',
        description: 'Shop dog food',
        path: '/categories/dog-food',
      });

      expect(pageMetadata.alternates?.canonical).toBe('https://www.sopet.org/categories/dog-food');
      expect(pageMetadata.openGraph?.url).toBe('https://www.sopet.org/categories/dog-food');
    });

    it('sets metadataBase from stripped base URL', () => {
      vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org/');

      const rootMetadata = buildRootMetadata();

      expect(rootMetadata.metadataBase).toEqual(new URL('https://www.sopet.org'));
    });
  });

  describe('branch B — unset SEO env safe defaults', () => {
    it('returns localhost and Sopet without throwing', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.NEXT_PUBLIC_SITE_NAME;
      delete process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

      expect(() => getSiteConfig()).not.toThrow();
      expect(getSiteConfig()).toEqual({
        baseUrl: 'http://localhost:3000',
        siteName: 'Sopet',
      });
    });

    it('buildPageMetadata does not throw on minimal input', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.NEXT_PUBLIC_SITE_NAME;

      expect(() =>
        buildPageMetadata({
          title: 'Minimal',
          description: 'Minimal description',
          path: '/',
        }),
      ).not.toThrow();
    });

    it('buildRootMetadata does not throw and omits verification when unset', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

      expect(() => buildRootMetadata()).not.toThrow();
      expect(buildRootMetadata().verification).toBeUndefined();
    });
  });

  describe('branch C — Google site verification', () => {
    it('exposes verification.google token when env is set', () => {
      vi.stubEnv('NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION', 'google-token-abc123');

      const rootMetadata = buildRootMetadata();

      expect(rootMetadata.verification).toEqual({ google: 'google-token-abc123' });
    });
  });

  it('preserves lang="th" on the root html element', () => {
    const layoutSource = readFileSync(resolve(__dirname, '../../app/layout.tsx'), 'utf8');

    expect(layoutSource).toMatch(/<html[^>]*lang="th"/);
  });
});

// -----------------------------------------------------------------------------
// Integration test 3 of 3
// -----------------------------------------------------------------------------
//
// AC1: "When /categories/[category] has filter query params (petType, brand, tag, minPrice, maxPrice), the system shall set noindex,follow and canonical to the unfiltered category URL (AC-006)"
// AC2: "When /categories/[category]?page=2 (or higher), the system shall set noindex,follow with canonical to page-1 unfiltered URL"
// AC3: "When /categories/[category] has no filters and page=1 (or absent), the system shall allow indexing with category-specific title/description"
// AC4: "When /search is requested with any query params (q, sort, petType, brand, minPrice, maxPrice), the system shall emit noindex,follow (AC-015)"
// AC5: "When bare /search is requested (no query params), the system shall emit noindex,follow (UI Spec scope override of PRD AC-016)"
// ROI: 81 (BV:9 × Freq:8 + Legal:0 + Defect:9)
// Behavior: Param matrix inputs → getCategoryIndexation / getSearchIndexation → robots + canonicalPath outputs per Design Doc table
// @category: integration
// @lane: integration
// @dependency: getCategoryIndexation, getSearchIndexation, isSellerIndexable, isProductIndexable
// @complexity: medium
// Primary failure mode: filtered or paginated category URLs remain indexable, or bare /search incorrectly allows index (PRD default regression)
// Proof obligation: exercise boundary paths — page=1 no filters (indexable), page=2 (noindex, canonical strips page), each filter key alone (noindex), combined filters, absent page; getSearchIndexation always indexable:false for bare and parameterized; isSellerIndexable false when status !== approved; pure functions, no mocks
// Verification points / expected results / pass criteria:
// - { slug: 'dog-food', params: {} } → indexable true, robots index true, canonicalPath /categories/dog-food
// - { page: '2' } → indexable false, robots follow true, canonicalPath /categories/dog-food
// - { petType: 'dog' } (and each filter key) → indexable false, canonicalPath unfiltered
// - getSearchIndexation() → indexable false, robots { index: false, follow: true }
// - isSellerIndexable({ status: 'pending' }) → false; approved → true
// - isProductIndexable unpublished/null → false
