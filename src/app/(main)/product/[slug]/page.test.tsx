import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
const permanentRedirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock('@/lib/graphql/apollo-rsc', () => ({
  getClient: () => ({
    query: queryMock,
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
  permanentRedirect: (url: string) => permanentRedirectMock(url),
}));

vi.mock('@/components/sections/ProductDetailsPage', () => ({
  default: ({
    productPath,
    productId,
    initialProductReviews,
  }: {
    productPath: string;
    productId?: string;
    initialProductReviews?: unknown[];
  }) => (
    <div data-testid="product-details">
      {productId ?? productPath}
      {initialProductReviews ? `:reviews-${initialProductReviews.length}` : ''}
    </div>
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
  permanentRedirectMock.mockClear();
  vi.restoreAllMocks();
  vi.resetModules();
});

const publishedProduct = {
  id: 'prod-1',
  slug: 'dog-food',
  name: 'Dog Food',
  status: 'published',
  store: { slug: 'sopet-pet-shop', status: 'approved' },
};

describe('ProductPage SSR soft-degrade', () => {
  it('does not call notFound when GraphQL SSR transport fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    queryMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const { default: ProductPage } = await import('./page');
    const element = await ProductPage({
      params: Promise.resolve({ slug: 'dog-food-sopet-pet-shop' }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element as ReactNode);

    expect(html).toContain('dog-food-sopet-pet-shop');
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      '[ssr-preload]',
      'product-by-path',
      expect.any(Error),
    );
  });

  it('calls notFound when API responds with no product', async () => {
    queryMock.mockResolvedValue({ data: { productByPath: null } });

    const { default: ProductPage } = await import('./page');
    await expect(
      ProductPage({
        params: Promise.resolve({ slug: 'missing-store' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
  });

  it('still renders the product when the reviews query fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    queryMock
      .mockResolvedValueOnce({ data: { productByPath: publishedProduct } })
      .mockRejectedValueOnce(new Error('reviews down'));

    const { default: ProductPage } = await import('./page');
    const element = await ProductPage({
      params: Promise.resolve({ slug: 'dog-food-sopet-pet-shop' }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element as ReactNode);

    expect(html).toContain('prod-1');
    expect(notFoundMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      '[ssr-preload]',
      'product-reviews',
      expect.any(Error),
    );
  });

  it('permanently redirects legacy UUID URLs to the SEO path', async () => {
    const legacyId = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
    queryMock.mockResolvedValue({ data: { product: publishedProduct } });

    const { default: ProductPage } = await import('./page');
    await expect(
      ProductPage({
        params: Promise.resolve({ slug: legacyId }),
        searchParams: Promise.resolve({ size: 'L' }),
      }),
    ).rejects.toThrow(`NEXT_REDIRECT:/product/dog-food-sopet-pet-shop?size=L`);
    expect(permanentRedirectMock).toHaveBeenCalledWith('/product/dog-food-sopet-pet-shop?size=L');
  });
});
