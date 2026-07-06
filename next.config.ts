import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
