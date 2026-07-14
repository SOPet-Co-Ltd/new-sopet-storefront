import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const graphqlBackendOrigin =
  process.env.GRAPHQL_SSR_URL?.replace(/\/graphql\/?$/, '') ?? 'http://localhost:3002';

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
    // Cloudflare R2 public buckets (pub-<hash>.r2.dev)
    {
      protocol: 'https',
      hostname: '**.r2.dev',
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

const nextConfig: NextConfig = {
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
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: `${graphqlBackendOrigin}/graphql`,
      },
    ];
  },
  images: {
    qualities: [75, 85],
    remotePatterns: imageRemotePatterns(),
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Allow private IPs for local MinIO
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
