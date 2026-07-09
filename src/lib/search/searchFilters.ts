import {
  SEARCH_FILTER_PRICE_MAX,
  SEARCH_FILTER_PRICE_MIN,
} from '@/components/molecules/SearchFilterSidebar/SearchFilterPriceRange';

export type SearchFilters = {
  petTypeIds: string[];
  brandIds: string[];
  minPrice?: number;
  maxPrice?: number;
};

function parseIdList(value: string | null | undefined): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePriceParam(
  value: string | null | undefined,
  fallback: number,
): number {
  if (!value) return fallback;

  const parsed = Number(value.replace(/[^\d]/g, ''));
  if (Number.isNaN(parsed)) return fallback;

  return Math.min(SEARCH_FILTER_PRICE_MAX, Math.max(SEARCH_FILTER_PRICE_MIN, parsed));
}

export function parseSearchFilters(
  params: Pick<URLSearchParams, 'get'>,
): SearchFilters {
  const petTypeIds = parseIdList(params.get('petType'));
  const brandIds = parseIdList(params.get('brand'));
  const minPrice = parsePriceParam(params.get('minPrice'), SEARCH_FILTER_PRICE_MIN);
  const maxPrice = parsePriceParam(params.get('maxPrice'), SEARCH_FILTER_PRICE_MAX);

  return {
    petTypeIds,
    brandIds,
    minPrice: minPrice > SEARCH_FILTER_PRICE_MIN ? minPrice : undefined,
    maxPrice: maxPrice < SEARCH_FILTER_PRICE_MAX ? maxPrice : undefined,
  };
}

export function hasSearchFilters(filters: SearchFilters): boolean {
  return (
    filters.petTypeIds.length > 0 ||
    filters.brandIds.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  );
}

export function toProductsFilterVariables(filters: SearchFilters): {
  petTypeIds?: string[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
} {
  return {
    petTypeIds: filters.petTypeIds.length > 0 ? filters.petTypeIds : undefined,
    brandIds: filters.brandIds.length > 0 ? filters.brandIds : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  };
}
