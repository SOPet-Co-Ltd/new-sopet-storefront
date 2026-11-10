import type { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { cache } from 'react';

import ProductDetailsPage from '@/components/sections/ProductDetailsPage';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import {
  ProductByIdDocument,
  ProductByPathDocument,
  ProductReviewsDocument,
  type ProductByIdQuery,
  type ProductReviewsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient } from '@/lib/graphql/apollo-rsc';
import {
  buildProductByIdVariables,
  buildProductByPathVariables,
} from '@/lib/graphql/query-variables';
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';
import { buildCategoryHref, resolveCategoryBySlug } from '@/lib/routing/categoryRoutes';
import {
  buildProductHref,
  decodeProductPathParam,
  isLegacyProductId,
} from '@/lib/routing/productRoutes';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchApprovedCategories } from '@/lib/seo/fetch';
import { isProductIndexable } from '@/lib/seo/indexability';
import { PRODUCT_REVIEWS_INITIAL_LIMIT } from '@/lib/constants/listPageSize';
import { buildBreadcrumbJsonLd, buildProductJsonLd } from '@/lib/seo/json-ld';
import { buildAbsoluteUrl, buildPageMetadata, buildProductMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ProductDetail = NonNullable<ProductByIdQuery['product']>;

/** Deduped across generateMetadata + page in the same RSC request. */
const loadProductByPath = cache(async (path: string) => {
  return runSsrPreloadQueries('product-by-path', async () => {
    const result = await getClient().query({
      query: ProductByPathDocument,
      variables: buildProductByPathVariables({ path }),
    });
    return result.data?.productByPath ?? null;
  });
});

const loadProductById = cache(async (id: string) => {
  return runSsrPreloadQueries('product-by-id', async () => {
    const result = await getClient().query({
      query: ProductByIdDocument,
      variables: buildProductByIdVariables({ id }),
    });
    return result.data?.product ?? null;
  });
});

/** Unicode path for redirects + metadata (Next encodes Location / Link as needed). */
function buildCanonicalProductPath(product: ProductDetail): string {
  return buildProductHref(product);
}

function withSearchParams(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    } else {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const segment = decodeProductPathParam(rawSlug);
  const fallbackPath = `/product/${segment}`;

  const preload = isLegacyProductId(segment)
    ? await loadProductById(segment)
    : await loadProductByPath(segment);

  if (!preload.ok) {
    return buildPageMetadata({
      title: 'สินค้า',
      description: DEFAULT_SITE_DESCRIPTION,
      path: fallbackPath,
      robots: { index: false, follow: true },
    });
  }

  const product = preload.data;

  if (!product) {
    return buildPageMetadata({
      title: 'สินค้าไม่พบ',
      description: DEFAULT_SITE_DESCRIPTION,
      path: fallbackPath,
      robots: { index: false, follow: false },
    });
  }

  return buildProductMetadata(product, buildCanonicalProductPath(product));
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug: rawSlug } = await params;
  const segment = decodeProductPathParam(rawSlug);
  const variantSearchParams = await searchParams;

  if (isLegacyProductId(segment)) {
    const preload = await loadProductById(segment);

    if (!preload.ok) {
      return (
        <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
          <ProductDetailsPage
            productPath={segment}
            productId={segment}
            variantSearchParams={variantSearchParams}
          />
        </main>
      );
    }

    const product = preload.data;
    if (!product || !isProductIndexable(product)) {
      notFound();
    }

    permanentRedirect(
      withSearchParams(buildProductHref(product, { encode: true }), variantSearchParams),
    );
  }

  const preload = await loadProductByPath(segment);

  // Transport / CF failure: let the client fetch (browser UA). Never notFound().
  if (!preload.ok) {
    return (
      <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
        <ProductDetailsPage productPath={segment} variantSearchParams={variantSearchParams} />
      </main>
    );
  }

  const product = preload.data;

  // API responded: missing or unpublished → 404.
  if (!product || !isProductIndexable(product)) {
    notFound();
  }

  const productPath = buildCanonicalProductPath(product);
  const pageUrl = buildAbsoluteUrl(productPath);

  const [reviewsPreload, categories] = await Promise.all([
    runSsrPreloadQueries('product-reviews', async () => {
      const result = await getClient().query({
        query: ProductReviewsDocument,
        variables: { productId: product.id, page: 1, limit: PRODUCT_REVIEWS_INITIAL_LIMIT },
      });
      return result.data?.productReviews ?? [];
    }),
    fetchApprovedCategories(),
  ]);

  const initialProductReviews: ProductReviewsQuery['productReviews'] = reviewsPreload.ok
    ? reviewsPreload.data
    : [];
  const productJsonLd = buildProductJsonLd(product, pageUrl, initialProductReviews);

  const resolvedCategory =
    categories && product.category
      ? resolveCategoryBySlug(categories, product.category)
      : undefined;

  const breadcrumbItems = [
    { name: 'หน้าแรก', url: buildAbsoluteUrl('/') },
    ...(resolvedCategory
      ? [
          {
            name: resolvedCategory.name,
            url: buildAbsoluteUrl(buildCategoryHref(resolvedCategory.slug)),
          },
        ]
      : []),
    { name: product.name, url: pageUrl },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <JsonLdScript data={[productJsonLd, breadcrumbJsonLd]} />
      <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
        <ProductDetailsPage
          productPath={segment}
          productId={product.id}
          initialProduct={product}
          initialProductReviews={initialProductReviews}
          variantSearchParams={variantSearchParams}
        />
      </main>
    </>
  );
}
