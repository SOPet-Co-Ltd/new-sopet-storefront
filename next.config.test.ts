import { describe, expect, it } from 'vitest';
import { getBeamConnectSrcOrigins } from './src/lib/config';
import nextConfig, { buildProductionCsp } from './next.config';

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

    // Vitest runs with NODE_ENV=test, so production CSP is applied.
    // Beam origin follows process.env (CI may set playground NEXT_PUBLIC_BEAM_API_BASE_URL).
    const [beamOrigin] = getBeamConnectSrcOrigins();
    expect(byKey['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(byKey['Content-Security-Policy']).toContain(beamOrigin);
    expect(byKey['Content-Security-Policy']).not.toContain('omise');
    expect(byKey['Content-Security-Policy']).toContain("img-src 'self' data: blob: https:");
    expect(byKey['Content-Security-Policy']).not.toContain("'wasm-unsafe-eval'");
    expect(byKey['Content-Security-Policy']).not.toContain("'unsafe-eval'");
    expect(byKey['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(byKey['X-Frame-Options']).toBe('DENY');
    expect(byKey['X-Content-Type-Options']).toBe('nosniff');
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('allows GraphQL API WebSocket origin in connect-src when backend origin is set', () => {
    const csp = buildProductionCsp({
      NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN: 'https://api.example.com',
    } as NodeJS.ProcessEnv);

    expect(csp).toContain('wss://api.example.com');
    expect(csp).toContain('https://api.beamcheckout.com');
  });

  it('allows explicit NEXT_PUBLIC_GRAPHQL_WS_URL origin in connect-src', () => {
    const csp = buildProductionCsp({
      NEXT_PUBLIC_GRAPHQL_WS_URL: 'wss://payments-api.sopet.org/graphql',
    } as NodeJS.ProcessEnv);

    expect(csp).toContain('wss://payments-api.sopet.org');
  });

  it('allows Beam playground API origin in connect-src when NEXT_PUBLIC_BEAM_API_BASE_URL is set', () => {
    const csp = buildProductionCsp({
      NEXT_PUBLIC_BEAM_API_BASE_URL: 'https://playground.api.beamcheckout.com',
    } as NodeJS.ProcessEnv);

    expect(csp).toContain('https://playground.api.beamcheckout.com');
  });

  it('defaults Beam connect-src to production API when NEXT_PUBLIC_BEAM_API_BASE_URL is unset', () => {
    const csp = buildProductionCsp({} as NodeJS.ProcessEnv);

    expect(csp).toContain('https://api.beamcheckout.com');
    expect(csp).not.toContain('https://playground.api.beamcheckout.com');
  });
});

describe('next.config images', () => {
  it('skips Vercel Image Optimization so product and cart images load from the CDN', () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
  });

  it('allows local MinIO (OrbStack) private IPs for next/image', () => {
    expect(nextConfig.images?.dangerouslyAllowLocalIP).toBe(true);
    expect(nextConfig.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          protocol: 'http',
          hostname: 'minio.sopet-backend.orb.local',
          port: '9000',
          pathname: '/sopet-ecommerce-files/**',
        }),
      ]),
    );
  });

  it('allows Cloudflare R2 public buckets and production CDN', () => {
    expect(nextConfig.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          protocol: 'https',
          hostname: '**.r2.dev',
          pathname: '/**',
        }),
        expect.objectContaining({
          protocol: 'https',
          hostname: 'cdn.sopet.org',
          pathname: '/**',
        }),
      ]),
    );
  });
});
