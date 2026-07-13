import type { Metadata } from 'next';

import { PRODUCT_STATUS_PUBLISHED, STORE_STATUS_APPROVED } from './constants';

export { PRODUCT_STATUS_PUBLISHED, STORE_STATUS_APPROVED };

export type CategorySearchParams = {
  page?: string;
  petType?: string;
  brand?: string;
  tag?: string;
  minPrice?: string;
  maxPrice?: string;
};

const CATEGORY_FILTER_KEYS = ['petType', 'brand', 'tag', 'minPrice', 'maxPrice'] as const;

function hasCategoryFilters(params: CategorySearchParams): boolean {
  return CATEGORY_FILTER_KEYS.some((key) => params[key] !== undefined && params[key] !== '');
}

function getCategoryPageNumber(page: string | undefined): number {
  return Math.max(1, Number(page ?? 1));
}

export function getCategoryIndexation(
  slug: string,
  params: CategorySearchParams = {},
): {
  indexable: boolean;
  robots: Metadata['robots'];
  canonicalPath: string;
} {
  const canonicalPath = `/categories/${slug}`;
  const pageNumber = getCategoryPageNumber(params.page);
  const indexable = pageNumber === 1 && !hasCategoryFilters(params);

  return {
    indexable,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    canonicalPath,
  };
}

export function getSearchIndexation(): {
  indexable: false;
  robots: { index: false; follow: true };
} {
  return {
    indexable: false,
    robots: { index: false, follow: true },
  };
}

export function isSellerIndexable(store: { status: string } | null | undefined): boolean {
  return store?.status === STORE_STATUS_APPROVED;
}

export function isProductIndexable(product: { status: string } | null | undefined): boolean {
  return product?.status === PRODUCT_STATUS_PUBLISHED;
}
