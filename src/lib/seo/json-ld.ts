import { getDefaultVariant } from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import type { ProductReview } from '@/lib/hooks/useReviews';

import {
  buildAbsoluteUrl,
  resolveAbsoluteImageUrl,
  stripMarkdownForMeta,
  truncateDescription,
} from './metadata';

export type SiteConfig = {
  baseUrl: string;
  siteName: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** Matches the PDP's initial visible review count. */
export const PRODUCT_JSON_LD_REVIEW_LIMIT = 4;

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

function mapReviewToJsonLd(review: ProductReview): Record<string, unknown> {
  const reviewJsonLd: Record<string, unknown> = {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.customerName || 'ลูกค้า',
    },
    datePublished: review.createdAt,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const body = review.comment?.trim();
  if (body) {
    reviewJsonLd.reviewBody = body;
  }

  return reviewJsonLd;
}

export function buildProductJsonLd(
  product: ProductDetail,
  pageUrl: string,
  reviews: ProductReview[] = [],
): Record<string, unknown> {
  const price = getDefaultOfferPrice(product);
  const defaultVariant = getDefaultVariant(product.variants);
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
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      price,
      priceCurrency: 'THB',
      availability: mapAvailability(getDefaultStockQuantity(product)),
      url: pageUrl,
    };

    if (product.store?.name) {
      const seller: Record<string, unknown> = {
        '@type': 'Organization',
        name: product.store.name,
      };
      if (product.store.slug) {
        seller.url = buildAbsoluteUrl(`/sellers/${product.store.slug}`);
      }
      offer.seller = seller;
    }

    jsonLd.offers = offer;
  }

  if (images.length > 0) {
    jsonLd.image = images.length === 1 ? images[0] : images;
  }

  if (defaultVariant?.sku) {
    jsonLd.sku = defaultVariant.sku;
  }

  if (product.brandName) {
    jsonLd.brand = {
      '@type': 'Brand',
      name: product.brandName,
    };
  }

  if (product.reviewCount > 0 && product.averageRating != null) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const reviewEntries = reviews.slice(0, PRODUCT_JSON_LD_REVIEW_LIMIT).map(mapReviewToJsonLd);
  if (reviewEntries.length > 0) {
    jsonLd.review = reviewEntries;
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

export function buildFaqJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildWebPageJsonLd(options: {
  name: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.name,
    description: truncateDescription(stripMarkdownForMeta(options.description)),
    url: options.url,
  };
}

export function buildCollectionPageJsonLd(options: {
  name: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: truncateDescription(stripMarkdownForMeta(options.description)),
    url: options.url,
  };
}
