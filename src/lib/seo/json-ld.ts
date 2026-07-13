import type { ProductDetail } from '@/lib/hooks/useProduct';

import { stripMarkdownForMeta, truncateDescription } from './metadata';

export type SiteConfig = {
  baseUrl: string;
  siteName: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

/**
 * JSON-LD offer price must come from server-fetched product data only — never from
 * client-side variant selection state, so structured data matches the initial SSR price.
 */
export function getDefaultOfferPrice(product: ProductDetail): number {
  const firstVariant = product.variants?.[0];
  return firstVariant?.price ?? product.basePrice;
}

function getDefaultStockQuantity(product: ProductDetail): number {
  const firstVariant = product.variants?.[0];
  if (firstVariant != null) {
    return firstVariant.stockQuantity;
  }

  return product.basePrice > 0 ? 1 : 0;
}

export function mapAvailability(stockQuantity: number): string {
  return stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

function collectProductImages(product: ProductDetail): string[] {
  const images = new Set<string>();

  if (product.thumbnailUrl) {
    images.add(product.thumbnailUrl);
  }

  for (const image of product.images ?? []) {
    if (image.imageUrl) {
      images.add(image.imageUrl);
    }
  }

  return [...images];
}

export function buildProductJsonLd(
  product: ProductDetail,
  pageUrl: string,
): Record<string, unknown> {
  const price = getDefaultOfferPrice(product);
  const firstVariant = product.variants?.[0];
  const description = truncateDescription(
    stripMarkdownForMeta(product.description ?? product.name),
  );
  const images = collectProductImages(product);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    url: pageUrl,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'THB',
      availability: mapAvailability(getDefaultStockQuantity(product)),
      url: pageUrl,
    },
  };

  if (images.length > 0) {
    jsonLd.image = images.length === 1 ? images[0] : images;
  }

  if (firstVariant?.sku) {
    jsonLd.sku = firstVariant.sku;
  }

  if (product.reviewCount > 0 && product.averageRating != null) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    };
  }

  return jsonLd;
}

export function buildOrganizationJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.siteName,
    url: config.baseUrl,
  };
}

export function buildWebSiteJsonLd(config: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
