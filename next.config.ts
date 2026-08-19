import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

function cdnRemotePattern(cdnUrl: string): RemotePattern | null {
  try {
    const parsed = new URL(cdnUrl);
    const protocol = parsed.protocol.replace(':', '');
    if (protocol !== 'http' && protocol !== 'https') {
      return null;
    }

    return {
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: '/**',
    };
  } catch {
    return null;
  }
}

function imageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    {
      protocol: 'http',
      hostname: 'minio.sopet-backend.orb.local',
      port: '9000',
      pathname: '/sopet-ecommerce-files/**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    // Cloudflare R2 — UAT public bucket + any pub-*.r2.dev
    {
      protocol: 'https',
      hostname: '**.r2.dev',
      pathname: '/**',
    },
    // Production custom domain for R2
    {
      protocol: 'https',
      hostname: 'cdn.sopet.org',
      pathname: '/**',
    },
  ];

  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL ?? process.env.CDN_URL;
  if (cdnUrl) {
    const pattern = cdnRemotePattern(cdnUrl);
    if (pattern) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

const isLocalDev = process.env.NODE_ENV === 'development';

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Next.js + Omise.js + GTM/GA require script hosts; tighten further when CMP lands.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.omise.co https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://api.omise.co https://vault.omise.co https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src 'self' https://cdn.omise.co https://www.googletagmanager.com",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Skip CSP locally so MinIO/http assets and HMR are unrestricted.
          ...(isLocalDev
            ? []
            : [{ key: 'Content-Security-Policy', value: productionCsp }]),
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
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
      {
        source: '/user/wishlist',
        destination: '/user/favorites',
        permanent: true,
      },
      {
        source: '/user/reviews/written',
        destination: '/user/reviews?tab=written',
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [75, 85],
    remotePatterns: imageRemotePatterns(),
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Serve original CDN/R2 URLs. Vercel Image Optimization returns 402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED once the transform quota is hit.
    unoptimized: true,
  },
};

export default nextConfig;
