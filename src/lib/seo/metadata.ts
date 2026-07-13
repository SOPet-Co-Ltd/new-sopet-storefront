import type { Metadata } from 'next';

import {
  DEFAULT_BASE_URL,
  DEFAULT_DESCRIPTION_MAX_LENGTH,
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

  return {
    title: input.title,
    description,
    robots,
    alternates: { canonical },
    openGraph: {
      title: `${input.title} | ${siteName}`,
      description,
      url: canonical,
      siteName,
      type: ogType,
      ...(input.ogImage ? { images: [{ url: input.ogImage }] } : {}),
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
  product: { name: string; description?: string | null; status: string },
  basePath: string,
): Metadata {
  const indexable = isProductIndexable(product);

  return buildPageMetadata({
    title: product.name,
    description: product.description ?? product.name,
    path: basePath,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  });
}

export function buildCategoryMetadata(
  categoryName: string,
  slug: string,
  indexable: boolean,
): Metadata {
  return buildPageMetadata({
    title: categoryName,
    description: `เลือกซื้อ${categoryName}จากร้านค้าที่ได้รับการอนุมัติบน Sopet`,
    path: `/categories/${slug}`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  });
}

export function buildSellerMetadata(
  store: { name: string; slug: string; description?: string | null; status: string },
  indexable: boolean,
): Metadata {
  return buildPageMetadata({
    title: store.name,
    description: store.description ?? `ร้านค้า ${store.name} บน Sopet`,
    path: `/sellers/${store.slug}`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
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
