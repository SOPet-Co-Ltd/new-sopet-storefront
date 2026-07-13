import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductDetailsPage from '@/components/sections/ProductDetailsPage';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { ProductByIdDocument } from '@/lib/graphql/generated/graphql';
import { PreloadQuery } from '@/lib/graphql/apollo-rsc';
import { buildProductByIdVariables } from '@/lib/graphql/query-variables';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchProductById } from '@/lib/seo/fetch';
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
  const product = await fetchProductById(id);

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
  const product = await fetchProductById(id);

  if (!product || !isProductIndexable(product)) {
    notFound();
  }

  const productPath = `/product/${id}`;
  const pageUrl = buildAbsoluteUrl(productPath);
  const productJsonLd = buildProductJsonLd(product, pageUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'หน้าแรก', url: buildAbsoluteUrl('/') },
    { name: product.name, url: pageUrl },
  ]);
  const variables = buildProductByIdVariables({ id });

  return (
    <>
      <JsonLdScript data={[productJsonLd, breadcrumbJsonLd]} />
      <PreloadQuery query={ProductByIdDocument} variables={variables}>
        <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
          <ProductDetailsPage productId={id} initialProduct={product} />
        </main>
      </PreloadQuery>
    </>
  );
}
