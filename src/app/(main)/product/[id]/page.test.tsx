import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('@/lib/graphql/apollo-rsc', () => ({
  getClient: () => ({
    query: queryMock,
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

vi.mock('@/components/sections/ProductDetailsPage', () => ({
  default: ({ productId }: { productId: string }) => (
    <div data-testid="product-details">{productId}</div>
  ),
}));

vi.mock('@/components/seo/JsonLdScript', () => ({
  JsonLdScript: () => null,
}));

vi.mock('@/lib/seo/fetch', () => ({
  fetchApprovedCategories: async () => [],
}));

afterEach(() => {
  queryMock.mockReset();
  notFoundMock.mockClear();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('ProductPage SSR soft-degrade', () => {
  it('does not call notFound when GraphQL SSR transport fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    queryMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const { default: ProductPage } = await import('./page');
    const element = await ProductPage({
      params: Promise.resolve({ id: 'prod-1' }),
    });
    const html = renderToStaticMarkup(element as ReactNode);

    expect(html).toContain('prod-1');
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('[ssr-preload]', 'product', expect.any(Error));
  });

  it('calls notFound when API responds with no product', async () => {
    queryMock.mockResolvedValue({ data: { product: null } });

    const { default: ProductPage } = await import('./page');
    await expect(ProductPage({ params: Promise.resolve({ id: 'missing' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(notFoundMock).toHaveBeenCalled();
  });
});
