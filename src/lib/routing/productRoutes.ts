import { UUID_V4_REGEX } from '@/lib/session';
import { decodeRouteParam, encodeRouteParam } from '@/lib/routing/categoryRoutes';

export type ProductPathInput = {
  slug?: string | null;
  store?: { slug?: string | null } | null;
  /** Fallback when store.slug is missing (legacy / incomplete payloads). */
  id?: string;
};

/** Build the SEO path segment `{productSlug}-{storeSlug}`. */
export function buildProductPathSegment(productSlug: string, storeSlug: string): string {
  return `${productSlug}-${storeSlug}`;
}

/**
 * Canonical product href: `/product/{productSlug}-{storeSlug}`.
 * Falls back to `/product/{id}` when store slug is unavailable so links still work.
 *
 * Pass `{ encode: true }` for `<Link href>` / share URLs. Leave encoding off for
 * `permanentRedirect` / server redirects so Next.js does not double-encode.
 */
export function buildProductHref(
  product: ProductPathInput,
  options: { encode?: boolean } = {},
): string {
  const storeSlug = product.store?.slug?.trim();
  if (product.slug && storeSlug) {
    const segment = buildProductPathSegment(product.slug, storeSlug);
    return `/product/${options.encode ? encodeRouteParam(segment) : segment}`;
  }

  if (product.id) {
    return `/product/${product.id}`;
  }

  throw new Error('buildProductHref requires slug+store.slug or id');
}

/** True when the route segment is a legacy product UUID (v4). */
export function isLegacyProductId(segment: string): boolean {
  return UUID_V4_REGEX.test(decodeRouteParam(segment));
}

export function decodeProductPathParam(segment: string): string {
  return decodeRouteParam(segment);
}
