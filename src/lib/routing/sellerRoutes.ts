import { decodeRouteParam, encodeRouteParam } from '@/lib/routing/categoryRoutes';

/** Seller storefront path. Encodes Thai (and other non-ASCII) slugs once. */
export function buildSellerHref(slug: string): string {
  return `/sellers/${encodeRouteParam(decodeRouteParam(slug))}`;
}

export function buildSellerReviewsHref(slug: string): string {
  return `${buildSellerHref(slug)}/reviews`;
}
