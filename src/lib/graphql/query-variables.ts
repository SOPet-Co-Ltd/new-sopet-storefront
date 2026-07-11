import type {
  ProductByIdQueryVariables,
  ProductsQueryVariables,
  RecommendedProductsQueryVariables,
  SearchContextInput,
  StoreBySlugQueryVariables,
} from '@/lib/graphql/generated/graphql';

export type ProductsListingVariablesInput = {
  category?: string | null;
  search?: string | null;
  storeId?: string | null;
  tag?: string | null;
  petTypeIds?: string[] | null;
  brandIds?: string[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  limit?: number;
  sortBy?: string | null;
  sortOrder?: 'ASC' | 'DESC' | null;
  sessionId?: string | null;
  searchContext?: SearchContextInput | null;
};

export function buildProductsListingVariables(
  params: ProductsListingVariablesInput = {},
): ProductsQueryVariables {
  const {
    category,
    search,
    storeId,
    tag,
    petTypeIds,
    brandIds,
    minPrice,
    maxPrice,
    page = 1,
    limit = 24,
    sortBy,
    sortOrder,
    sessionId,
    searchContext,
  } = params;

  return {
    category,
    search,
    storeId,
    tag,
    petTypeIds: petTypeIds && petTypeIds.length > 0 ? petTypeIds : undefined,
    brandIds: brandIds && brandIds.length > 0 ? brandIds : undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    page,
    limit,
    sortBy,
    sortOrder,
    sessionId: sessionId ?? undefined,
    searchContext: searchContext ?? undefined,
  };
}

export function buildApprovedCategoriesVariables(): Record<string, never> {
  return {};
}

export function buildApprovedPetTypesVariables(): Record<string, never> {
  return {};
}

export function buildApprovedBrandsVariables(): Record<string, never> {
  return {};
}

export function buildRecommendedProductsVariables({
  limit = 25,
  sessionId,
  searchContext,
  excludeProductIds,
  shuffleSeed,
}: {
  limit?: number;
  sessionId?: string | null;
  searchContext?: SearchContextInput | null;
  excludeProductIds?: string[] | null;
  shuffleSeed?: string | null;
} = {}): RecommendedProductsQueryVariables {
  return {
    limit,
    sessionId: sessionId ?? undefined,
    searchContext: searchContext ?? undefined,
    excludeProductIds:
      excludeProductIds && excludeProductIds.length > 0 ? excludeProductIds : undefined,
    shuffleSeed: shuffleSeed ?? undefined,
  };
}

export function buildProductByIdVariables({ id }: { id: string }): ProductByIdQueryVariables {
  return { id };
}

export function buildSellerStorefrontVariables({
  handle,
}: {
  handle: string;
}): StoreBySlugQueryVariables {
  return { slug: handle };
}
