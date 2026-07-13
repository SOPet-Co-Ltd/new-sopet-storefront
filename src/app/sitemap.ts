import type { MetadataRoute } from 'next';

import { collectSitemapUrls } from '@/lib/seo/sitemap-sources';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return collectSitemapUrls();
}
