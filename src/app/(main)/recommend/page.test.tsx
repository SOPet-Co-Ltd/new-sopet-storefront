import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();
const preloadQueryCalls: Array<{ errorPolicy?: string }> = [];

vi.mock('@/lib/graphql/apollo-rsc', () => ({
  getClient: () => ({
    query: queryMock,
  }),
  PreloadQuery: ({ children, errorPolicy }: { children: ReactNode; errorPolicy?: string }) => {
    preloadQueryCalls.push({ errorPolicy });
    return children;
  },
}));

vi.mock('@/components/sections/RecommendProductListing', () => ({
  RecommendProductListing: () => <div data-testid="recommend-listing">listing</div>,
}));

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return {
    ...actual,
    randomUUID: () => 'test-shuffle-seed',
  };
});

afterEach(() => {
  queryMock.mockReset();
  preloadQueryCalls.length = 0;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('RecommendPage SSR degrade', () => {
  it('renders without PreloadQuery when GraphQL SSR fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    queryMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const { default: RecommendPage } = await import('./page');
    const element = await RecommendPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('listing');
    expect(html).toContain('สินค้าแนะนำสำหรับคุณ');
    expect(preloadQueryCalls).toHaveLength(0);
    expect(consoleError).toHaveBeenCalledWith('[ssr-preload]', 'recommend', expect.any(Error));
  });

  it('wraps with PreloadQuery and errorPolicy=all when SSR succeeds', async () => {
    queryMock.mockResolvedValue({
      data: { recommendedProducts: [] },
    });

    const { default: RecommendPage } = await import('./page');
    const element = await RecommendPage({ searchParams: Promise.resolve({}) });
    renderToStaticMarkup(element);

    expect(preloadQueryCalls).toEqual([{ errorPolicy: 'all' }]);
  });
});
