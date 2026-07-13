import type { MetadataRoute } from 'next';

import { POLICY_PATHS } from './constants';
import { fetchAllSitemapProducts, fetchApprovedCategories, fetchApprovedStores } from './fetch';
import { buildAbsoluteUrl } from './metadata';

/**
 * Collects all public sitemap URLs from static paths and GraphQL-backed sources.
 * When a GraphQL source fails, its URLs are omitted rather than failing the entire sitemap.
 *
 * Scale note: when URL count approaches ~45k, migrate to Next.js `generateSitemaps` index pattern.
 */
export async function collectSitemapUrls(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [{ url: buildAbsoluteUrl('/') }];

  for (const policy of POLICY_PATHS) {
    entries.push({ url: buildAbsoluteUrl(`/policy/${policy.pathSegment}`) });
  }

  const [categories, products, stores] = await Promise.all([
    fetchApprovedCategories(),
    fetchAllSitemapProducts(),
    fetchApprovedStores(),
  ]);

  if (categories) {
    for (const category of categories) {
      entries.push({ url: buildAbsoluteUrl(`/categories/${category.slug}`) });
    }
  }

  if (products) {
    for (const product of products) {
      entries.push({ url: buildAbsoluteUrl(`/product/${product.id}`) });
    }
  }

  if (stores) {
    for (const store of stores) {
      entries.push({ url: buildAbsoluteUrl(`/sellers/${store.slug}`) });
    }
  }

  return entries;
}
