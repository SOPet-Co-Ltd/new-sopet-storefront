import type { ReactNode } from 'react';
import { graphql, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CATALOG_PRODUCT_ID,
  sampleCategories,
  sampleProductCard,
  sampleStore,
} from '@/test/mocks/fixtures/catalog';
import { server } from '@/test/mocks/server';

vi.mock('@/lib/graphql/apollo-rsc', async () => {
  const { makeApolloClient } = await import('@/lib/graphql/client');
  const client = makeApolloClient();

  return {
    getClient: () => client,
    query: client.query.bind(client),
    PreloadQuery: ({ children }: { children: ReactNode }) => children,
  };
});

import { POLICY_PATHS } from './constants';

const ORIGINAL_ENV = { ...process.env };

function useStoresHandler(): void {
  server.use(
    graphql.query('Stores', () => {
      return HttpResponse.json({
        data: { stores: [sampleStore] },
      });
    }),
  );
}

beforeEach(() => {
  useStoresHandler();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('collectSitemapUrls', () => {
  it('omits failed GraphQL sources while retaining other URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    server.use(
      graphql.query('Products', () => {
        return HttpResponse.json(
          {
            errors: [{ message: 'Products unavailable' }],
          },
          { status: 500 },
        );
      }),
    );

    const { collectSitemapUrls: collectUrls } = await import('./sitemap-sources');
    const entries = await collectUrls();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://www.sopet.org/');
    expect(urls).toContain('https://www.sopet.org/categories/dog-food');
    expect(urls).toContain(`https://www.sopet.org/sellers/${sampleStore.slug}`);
    expect(urls.some((url) => url.includes('/product/'))).toBe(false);
    expect(urls.length).toBeGreaterThanOrEqual(1 + POLICY_PATHS.length + sampleCategories.length);
  });

  it('includes home, policies, categories, products, and sellers with absolute URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const { collectSitemapUrls: collectUrls } = await import('./sitemap-sources');
    const entries = await collectUrls();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://www.sopet.org/');
    expect(urls).toContain(`https://www.sopet.org/product/${CATALOG_PRODUCT_ID}`);
    expect(urls).toContain('https://www.sopet.org/categories/dog-food');
    expect(urls).toContain(`https://www.sopet.org/sellers/${sampleStore.slug}`);

    for (const policy of POLICY_PATHS) {
      expect(urls).toContain(`https://www.sopet.org/policy/${policy.pathSegment}`);
    }
  });

  it('uses absolute UUID product URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const { collectSitemapUrls: collectUrls } = await import('./sitemap-sources');
    const entries = await collectUrls();
    const productUrl = entries.find((entry) => entry.url.includes('/product/'))?.url;

    expect(productUrl).toBe(`https://www.sopet.org/product/${sampleProductCard.id}`);
    expect(productUrl).not.toContain(sampleProductCard.slug);
  });
});
