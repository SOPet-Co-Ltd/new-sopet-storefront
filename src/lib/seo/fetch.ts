import { cache } from 'react';

import { getClient } from '@/lib/graphql/apollo-rsc';
import {
  ApprovedCategoriesDocument,
  ProductByIdDocument,
  ProductsDocument,
  StoreBySlugDocument,
  StoresDocument,
  type ProductByIdQuery,
  type ProductsQuery,
} from '@/lib/graphql/generated/graphql';
import {
  buildApprovedCategoriesVariables,
  buildProductByIdVariables,
  buildProductsListingVariables,
  buildSellerStorefrontVariables,
} from '@/lib/graphql/query-variables';
import { STORE_STATUS_APPROVED } from './constants';

const SITEMAP_PRODUCTS_PAGE_LIMIT = 250;

type ProductDetail = NonNullable<ProductByIdQuery['product']>;
type SitemapProduct = ProductsQuery['products']['items'][number];

async function queryProductById(id: string): Promise<ProductDetail | null> {
  try {
    const result = await getClient().query({
      query: ProductByIdDocument,
      variables: buildProductByIdVariables({ id }),
    });

    return result.data?.product ?? null;
  } catch {
    return null;
  }
}

export const fetchProductById = cache(queryProductById);

async function queryApprovedCategories() {
  try {
    const result = await getClient().query({
      query: ApprovedCategoriesDocument,
      variables: buildApprovedCategoriesVariables(),
    });

    return result.data?.approvedCategories ?? [];
  } catch {
    return null;
  }
}

export const fetchApprovedCategories = cache(queryApprovedCategories);

async function queryStoreBySlug(slug: string) {
  try {
    const result = await getClient().query({
      query: StoreBySlugDocument,
      variables: buildSellerStorefrontVariables({ handle: slug }),
    });

    return result.data?.storeBySlug ?? null;
  } catch {
    return null;
  }
}

export const fetchStoreBySlug = cache(queryStoreBySlug);

async function queryAllSitemapProducts(): Promise<SitemapProduct[] | null> {
  const allItems: SitemapProduct[] = [];

  try {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getClient().query({
        query: ProductsDocument,
        variables: buildProductsListingVariables({
          page,
          limit: SITEMAP_PRODUCTS_PAGE_LIMIT,
        }),
      });

      const products = result.data?.products;
      if (!products) {
        break;
      }

      allItems.push(...products.items);
      totalPages = products.pagination.totalPages;
      page += 1;
    }

    return allItems;
  } catch {
    return null;
  }
}

export const fetchAllSitemapProducts = cache(queryAllSitemapProducts);

async function queryApprovedStores() {
  try {
    const result = await getClient().query({
      query: StoresDocument,
    });

    const stores = result.data?.stores ?? [];
    return stores.filter((store) => store.status === STORE_STATUS_APPROVED);
  } catch {
    return null;
  }
}

export const fetchApprovedStores = cache(queryApprovedStores);
