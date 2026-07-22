import { getDefaultVariant } from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import type { ProductDetail } from '@/lib/hooks/useProduct';

import { resolveAbsoluteImageUrl, stripMarkdownForMeta, truncateDescription } from './metadata';

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
 * client-side variant selection state, so structured data matches the initial SSR price
 * (cheapest in-stock variant, same as the PDP default selection).
 */
export function getDefaultOfferPrice(product: ProductDetail): number {
  const defaultVariant = getDefaultVariant(product.variants);
  return defaultVariant?.price ?? product.basePrice;
}

function getDefaultStockQuantity(product: ProductDetail): number {
  const defaultVariant = getDefaultVariant(product.variants);
  if (defaultVariant != null) {
    return defaultVariant.stockQuantity;
  }

  return product.basePrice > 0 ? 1 : 0;
}

export function mapAvailability(stockQuantity: number): string {
  return stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
}

function collectProductImages(product: ProductDetail): string[] {
  const images = new Set<string>();

  const thumbnailUrl = resolveAbsoluteImageUrl(product.thumbnailUrl);
  if (thumbnailUrl) {
    images.add(thumbnailUrl);
  }

  for (const image of product.images ?? []) {
    const imageUrl = resolveAbsoluteImageUrl(image.imageUrl);
    if (imageUrl) {
      images.add(imageUrl);
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
  };

  if (price > 0) {
    jsonLd.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: 'THB',
      availability: mapAvailability(getDefaultStockQuantity(product)),
      url: pageUrl,
    };
  }

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
