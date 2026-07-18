import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetailsPage from '@/components/sections/ProductDetailsPage';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { ProductByIdDocument } from '@/lib/graphql/generated/graphql';
import { getClient } from '@/lib/graphql/apollo-rsc';
import { buildProductByIdVariables } from '@/lib/graphql/query-variables';
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';
import { buildCategoryHref, resolveCategoryBySlug } from '@/lib/routing/categoryRoutes';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchApprovedCategories } from '@/lib/seo/fetch';
import { isProductIndexable } from '@/lib/seo/indexability';
import { buildBreadcrumbJsonLd, buildProductJsonLd } from '@/lib/seo/json-ld';
import { buildAbsoluteUrl, buildPageMetadata, buildProductMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productPath = `/product/${id}`;
  const variables = buildProductByIdVariables({ id });

  // Do not use fetchProductById here: it collapses transport failures to null,
  // which wrongly labels CF/SSR outages as "สินค้าไม่พบ".
  const preload = await runSsrPreloadQueries('product-metadata', async () => {
    const result = await getClient().query({
      query: ProductByIdDocument,
      variables,
    });
    return result.data?.product ?? null;
  });

  if (!preload.ok) {
    return buildPageMetadata({
      title: 'สินค้า',
      description: DEFAULT_SITE_DESCRIPTION,
      path: productPath,
      robots: { index: false, follow: true },
    });
  }

  const product = preload.data;

  if (!product) {
    return buildPageMetadata({
      title: 'สินค้าไม่พบ',
      description: DEFAULT_SITE_DESCRIPTION,
      path: productPath,
      robots: { index: false, follow: false },
    });
  }

  return buildProductMetadata(product, productPath);
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const variables = buildProductByIdVariables({ id });

  const preload = await runSsrPreloadQueries('product', async () => {
    const result = await getClient().query({
      query: ProductByIdDocument,
      variables,
    });
    return result.data?.product ?? null;
  });

  // Transport / CF failure: let the client fetch (browser UA). Never notFound().
  if (!preload.ok) {
    return (
      <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
        <ProductDetailsPage productId={id} />
      </main>
    );
  }

  const product = preload.data;

  // API responded: missing or unpublished → 404.
  if (!product || !isProductIndexable(product)) {
    notFound();
  }

  const productPath = `/product/${id}`;
  const pageUrl = buildAbsoluteUrl(productPath);
  const productJsonLd = buildProductJsonLd(product, pageUrl);

  const categories = await fetchApprovedCategories();
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
        <ProductDetailsPage productId={id} initialProduct={product} />
      </main>
    </>
  );
}
