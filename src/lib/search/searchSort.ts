import type { SearchSortValue } from '@/components/molecules/SearchSortBar';

export type ProductSortParams = {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
};

export function parseSearchSort(sort: SearchSortValue | null | undefined): ProductSortParams {
  switch (sort) {
    case 'best-sellers':
      return { sortBy: 'soldCount', sortOrder: 'DESC' };
    case 'price-asc':
      return { sortBy: 'basePrice', sortOrder: 'ASC' };
    case 'price-desc':
      return { sortBy: 'basePrice', sortOrder: 'DESC' };
    case 'rating-asc':
      return { sortBy: 'averageRating', sortOrder: 'ASC' };
    case 'rating-desc':
      return { sortBy: 'averageRating', sortOrder: 'DESC' };
    case 'relevance':
    default:
      return { sortBy: 'relevance', sortOrder: 'DESC' };
  }
}
