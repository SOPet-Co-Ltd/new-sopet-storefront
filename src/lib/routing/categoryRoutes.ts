import type { Category } from '@/lib/hooks/useCategories';

/** Decode a dynamic route segment that may contain percent-encoded Thai (or other non-ASCII) text. */
export function decodeRouteParam(value: string): string {
  if (!/%[0-9A-Fa-f]{2}/.test(value)) {
    return value;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Encode a slug for safe use in a URL path segment. */
export function encodeRouteParam(value: string): string {
  return encodeURIComponent(value);
}

export function buildCategoryHref(slug: string): string {
  return `/categories/${encodeRouteParam(slug)}`;
}

export function resolveCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  const decodedSlug = decodeRouteParam(slug);

  return categories.find((item) => decodeRouteParam(item.slug) === decodedSlug);
}

/** Products API filters by category name, while URLs use the taxonomy slug. */
export function resolveCategoryFilterName(categories: Category[], slug: string): string {
  const category = resolveCategoryBySlug(categories, slug);
  return category?.name ?? decodeRouteParam(slug);
}
