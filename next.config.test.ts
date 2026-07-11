import { describe, expect, it } from 'vitest';
import nextConfig from './next.config';

describe('next.config redirects', () => {
  it('redirects /products to /search and /categories to home', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/products',
          destination: '/search',
          permanent: true,
        },
        {
          source: '/categories',
          destination: '/',
          permanent: true,
        },
      ]),
    );
  });
});
