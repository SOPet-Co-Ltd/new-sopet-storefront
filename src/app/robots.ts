import type { MetadataRoute } from 'next';

import { getSiteConfig } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  const { baseUrl } = getSiteConfig();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/user/',
        '/login',
        '/signout',
        '/login/otp',
        '/cart',
        '/checkout',
        '/payment/',
        '/track/',
        '/order/',
        '/thank-you/',
        '/recommend',
        '/search',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
