import type { NextConfig } from "next";

const graphqlBackendOrigin =
  process.env.GRAPHQL_SSR_URL?.replace(/\/graphql\/?$/, "") ??
  "http://localhost:3002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: `${graphqlBackendOrigin}/graphql`,
      },
    ];
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "minio.sopet-backend.orb.local",
        port: "9000",
        pathname: "/sopet-ecommerce-files/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    // Allow private IPs for local MinIO
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
