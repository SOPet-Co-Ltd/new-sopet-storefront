import type { ReactNode } from 'react';
import { graphql, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_PRODUCT_ID, sampleStore } from '@/test/mocks/fixtures/catalog';
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

import { POLICY_PATHS } from '@/lib/seo/constants';
import { revalidate } from './sitemap';

const EXCLUDED_PATHS = ['/search', '/checkout', '/cart', '/user/', '/login'];

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

describe('sitemap route', () => {
  it('exports revalidate 3600', () => {
    expect(revalidate).toBe(3600);
  });

  it('still returns partial sitemap when one GraphQL source fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    server.use(
      graphql.query('ApprovedCategories', () => {
        return HttpResponse.json(
          {
            errors: [{ message: 'Categories unavailable' }],
          },
          { status: 500 },
        );
      }),
    );

    const { default: sitemap } = await import('./sitemap');
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://www.sopet.org/');
    expect(urls).toContain(`https://www.sopet.org/product/${CATALOG_PRODUCT_ID}`);
    expect(urls.some((url) => url.includes('/categories/'))).toBe(false);
  });

  it('returns sitemap entries excluding transactional routes', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const { default: sitemap } = await import('./sitemap');
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://www.sopet.org/');
    expect(urls).toContain(`https://www.sopet.org/product/${CATALOG_PRODUCT_ID}`);
    expect(urls).toContain('https://www.sopet.org/categories/dog-food');
    expect(urls).toContain(`https://www.sopet.org/sellers/${sampleStore.slug}`);

    for (const policy of POLICY_PATHS) {
      expect(urls).toContain(`https://www.sopet.org/policy/${policy.pathSegment}`);
    }

    for (const excludedPath of EXCLUDED_PATHS) {
      expect(urls.some((url) => url.includes(excludedPath))).toBe(false);
    }
  });
});
