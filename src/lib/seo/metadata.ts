import type { Metadata } from 'next';

import {
  DEFAULT_BASE_URL,
  DEFAULT_DESCRIPTION_MAX_LENGTH,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from './constants';
import { getSearchIndexation, isProductIndexable } from './indexability';

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  robots?: Metadata['robots'];
  ogImage?: string | null;
  ogType?: 'website' | 'article';
  /**
   * Hreflang extension point (FR-012): when multi-locale routes ship, pass
   * `alternates.languages` here — e.g. `{ 'th-TH': '/path', 'en-US': '/en/path' }`.
   * MVP emits canonical only; no alternate language links are rendered yet.
   */
  languages?: NonNullable<Metadata['alternates']>['languages'];
};

export function getSiteConfig(): { baseUrl: string; siteName: string } {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;

  return { baseUrl, siteName };
}

export function buildAbsoluteUrl(path: string): string {
  const { baseUrl } = getSiteConfig();
  return `${baseUrl}${path}`;
}

export function getDefaultOgImageUrl(): string {
  return buildAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

export function resolveAbsoluteImageUrl(url: string | null | undefined): string | undefined {
  if (url == null || url === '') {
    return undefined;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return buildAbsoluteUrl(normalizedPath);
}

export function resolveOgImageUrl(ogImage?: string | null): string {
  return resolveAbsoluteImageUrl(ogImage) ?? getDefaultOgImageUrl();
}

export function truncateDescription(
  text: string | null | undefined,
  maxLen: number = DEFAULT_DESCRIPTION_MAX_LENGTH,
): string {
  if (text == null || text === '') {
    return '';
  }

  if (text.length <= maxLen) {
    return text;
  }

  const truncated = text.slice(0, maxLen - 1).trimEnd();
  return `${truncated}…`;
}

export function stripMarkdownForMeta(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { baseUrl, siteName } = getSiteConfig();
  const canonical = `${baseUrl}${input.path}`;
  const description = truncateDescription(stripMarkdownForMeta(input.description));
  const robots = input.robots ?? { index: true, follow: true };
  const ogType = input.ogType ?? 'website';
  const ogImageUrl = resolveOgImageUrl(input.ogImage);
  const openGraphTitle = `${input.title} | ${siteName}`;

  return {
    title: input.title,
    description,
    robots,
    alternates: {
      canonical,
      ...(input.languages ? { languages: input.languages } : {}),
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url: canonical,
      siteName,
      type: ogType,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: openGraphTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export function buildHomeMetadata(): Metadata {
  const { siteName } = getSiteConfig();

  return buildPageMetadata({
    title: siteName,
    description: DEFAULT_SITE_DESCRIPTION,
    path: '/',
  });
}

export function buildProductMetadata(
  product: {
    name: string;
    description?: string | null;
    status: string;
    thumbnailUrl?: string | null;
    images?: Array<{ imageUrl?: string | null }> | null;
  },
  basePath: string,
): Metadata {
  const indexable = isProductIndexable(product);
  const ogImage =
    resolveAbsoluteImageUrl(product.thumbnailUrl) ??
    resolveAbsoluteImageUrl(product.images?.[0]?.imageUrl);

  return buildPageMetadata({
    title: product.name,
    description: product.description ?? product.name,
    path: basePath,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    ogImage,
  });
}

export function buildCategoryMetadata(
  categoryName: string,
  slug: string,
  indexable: boolean,
  imageUrl?: string | null,
): Metadata {
  return buildPageMetadata({
    title: categoryName,
    description: `เลือกซื้อ${categoryName}จากร้านค้าที่ได้รับการอนุมัติบน Sopet`,
    path: `/categories/${slug}`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    ogImage: resolveAbsoluteImageUrl(imageUrl),
  });
}

export function buildSellerMetadata(
  store: {
    name: string;
    slug: string;
    description?: string | null;
    status: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  },
  indexable: boolean,
): Metadata {
  const ogImage =
    resolveAbsoluteImageUrl(store.logoUrl) ?? resolveAbsoluteImageUrl(store.bannerUrl);

  return buildPageMetadata({
    title: store.name,
    description: store.description ?? `ร้านค้า ${store.name} บน Sopet`,
    path: `/sellers/${store.slug}`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    ogImage,
  });
}

export function buildSearchMetadata(): Metadata {
  const { robots } = getSearchIndexation();

  return buildPageMetadata({
    title: 'ค้นหาสินค้า',
    description: 'ค้นหายาและสินค้าสำหรับสัตว์เลี้ยงบน Sopet',
    path: '/search',
    robots,
  });
}

export function buildPolicyPageMetadata(options: {
  pathSegment: string;
  title: string;
  description: string;
}): Metadata {
  const { pathSegment, title, description } = options;

  return buildPageMetadata({
    title,
    description,
    path: `/policy/${pathSegment}`,
    robots: { index: true, follow: true },
  });
}
