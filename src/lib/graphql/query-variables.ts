import type {
  ProductByIdQueryVariables,
  ProductsQueryVariables,
  RecommendedProductsQueryVariables,
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
}: {
  limit?: number;
} = {}): RecommendedProductsQueryVariables {
  return { limit };
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
