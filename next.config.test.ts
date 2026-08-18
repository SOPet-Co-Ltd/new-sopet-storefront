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

describe('next.config security headers', () => {
  it('sets CSP, HSTS, and frame protection on all routes', async () => {
    const headers = await nextConfig.headers?.();
    const globalHeaders = headers?.find((entry) => entry.source === '/:path*')?.headers ?? [];
    const byKey = Object.fromEntries(globalHeaders.map((h) => [h.key, h.value]));

    expect(byKey['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(byKey['Content-Security-Policy']).toContain('https://cdn.omise.co');
    expect(byKey['Content-Security-Policy']).not.toContain("'wasm-unsafe-eval'");
    expect(byKey['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(byKey['X-Frame-Options']).toBe('DENY');
    expect(byKey['X-Content-Type-Options']).toBe('nosniff');
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });
});

describe('next.config images', () => {
  it('skips Vercel Image Optimization so product and cart images load from the CDN', () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it('allows Cloudflare R2 public buckets', () => {
    expect(nextConfig.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          protocol: 'https',
          hostname: '**.r2.dev',
          pathname: '/**',
        }),
      ]),
    );
  });
});
