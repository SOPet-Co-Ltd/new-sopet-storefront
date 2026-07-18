import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();

vi.mock('@/lib/graphql/apollo-rsc', () => ({
  getClient: () => ({
    query: queryMock,
  }),
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
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('RecommendPage SSR degrade', () => {
  it('renders without throwing when GraphQL SSR fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    queryMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const { default: RecommendPage } = await import('./page');
    const element = await RecommendPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('listing');
    expect(html).toContain('สินค้าแนะนำสำหรับคุณ');
    expect(consoleError).toHaveBeenCalledWith('[ssr-preload]', 'recommend', expect.any(Error));
  });
});
