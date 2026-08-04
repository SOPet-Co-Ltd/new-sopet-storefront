import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildAbsoluteUrl,
  buildHomeMetadata,
  buildPageMetadata,
  buildProductMetadata,
  getDefaultOgImageUrl,
  getSiteConfig,
  stripMarkdownForMeta,
  truncateDescription,
} from './metadata';
import { CATALOG_PRODUCT_ID, sampleProductDetail } from '@/test/mocks/fixtures/catalog';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('getSiteConfig', () => {
  it('strips trailing slash from NEXT_PUBLIC_BASE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org/');
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'SOPET');

    expect(getSiteConfig()).toEqual({
      baseUrl: 'https://www.sopet.org',
      siteName: 'SOPET',
    });
  });

  it('falls back to localhost and Sopet when SEO env vars are unset', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.NEXT_PUBLIC_SITE_NAME;

    expect(getSiteConfig()).toEqual({
      baseUrl: 'http://localhost:3000',
      siteName: 'Sopet',
    });
  });
});

describe('buildAbsoluteUrl', () => {
  it('builds an absolute URL from a pathname using configured base URL', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org/');

    expect(buildAbsoluteUrl('/categories/dog-food')).toBe(
      'https://www.sopet.org/categories/dog-food',
    );
  });
});

describe('buildPageMetadata', () => {
  it('returns canonical and openGraph URLs that match the absolute page URL', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'SOPET');

    const metadata = buildPageMetadata({
      title: 'Dog Food',
      description: 'Shop dog food',
      path: '/categories/dog-food',
    });

    expect(metadata.alternates?.canonical).toBe('https://www.sopet.org/categories/dog-food');
    expect(metadata.openGraph?.url).toBe('https://www.sopet.org/categories/dog-food');
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://www.sopet.org/og/default-og.jpg' },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['https://www.sopet.org/og/default-og.jpg'],
    });
  });

  it('does not throw on minimal input', () => {
    expect(() =>
      buildPageMetadata({
        title: 'Minimal',
        description: 'Minimal description',
        path: '/',
      }),
    ).not.toThrow();
  });
});

describe('getDefaultOgImageUrl', () => {
  it('returns an absolute URL for the default OG asset', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    expect(getDefaultOgImageUrl()).toBe('https://www.sopet.org/og/default-og.jpg');
  });
});

describe('buildHomeMetadata', () => {
  it('includes the default OG image on home metadata', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const metadata = buildHomeMetadata();

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://www.sopet.org/og/default-og.jpg' },
    ]);
  });
});

describe('buildProductMetadata', () => {
  it('uses absolute thumbnailUrl for OG and twitter images when present', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const metadata = buildProductMetadata(sampleProductDetail, `/product/${CATALOG_PRODUCT_ID}`);

    expect(metadata.openGraph?.images).toEqual([{ url: sampleProductDetail.thumbnailUrl }]);
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [sampleProductDetail.thumbnailUrl],
    });
  });
});

describe('truncateDescription', () => {
  it('truncates long text to the default max length', () => {
    const longText = 'a'.repeat(200);

    expect(truncateDescription(longText)).toHaveLength(160);
    expect(
      truncateDescription(longText).endsWith('…') || truncateDescription(longText).length === 160,
    ).toBe(true);
  });

  it('returns an empty string for nullish input', () => {
    expect(truncateDescription(null)).toBe('');
    expect(truncateDescription(undefined)).toBe('');
  });
});

describe('stripMarkdownForMeta', () => {
  it('removes markdown syntax for meta descriptions', () => {
    expect(stripMarkdownForMeta('**Bold** and [link](https://example.com)')).toBe('Bold and link');
  });
});
