import type { Metadata } from 'next';
import {
  ProductsDocument,
  StoreBySlugDocument,
  type ProductsQuery,
  type StoreBySlugQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import {
  buildProductsListingVariables,
  buildSellerStorefrontVariables,
} from '@/lib/graphql/query-variables';
import { SellerStorefront } from '@/components/organisms/SellerTabs';
import { Breadcrumbs } from '@/components/atoms/Breadcrumbs/Breadcrumbs';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { fetchStoreBySlug } from '@/lib/seo/fetch';
import { isSellerIndexable } from '@/lib/seo/indexability';
import { buildBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { buildAbsoluteUrl, buildPageMetadata, buildSellerMetadata } from '@/lib/seo/metadata';

export const revalidate = 60;

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const store = await fetchStoreBySlug(handle);

  if (!store) {
    return buildPageMetadata({
      title: 'ร้านค้าไม่พบ',
      description: DEFAULT_SITE_DESCRIPTION,
      path: `/sellers/${handle}`,
      robots: { index: false, follow: true },
    });
  }

  return buildSellerMetadata(store, isSellerIndexable(store));
}

export default async function SellerPage({ params }: Props) {
  const { handle } = await params;
  const storeVariables = buildSellerStorefrontVariables({ handle });
  const store = await fetchStoreBySlug(handle);

  const initialStore: StoreBySlugQuery['storeBySlug'] | undefined = store ?? undefined;
  let initialProducts: ProductsQuery['products']['items'] | undefined;
  let productVariables: ReturnType<typeof buildProductsListingVariables> | null = null;

  if (store?.id) {
    productVariables = buildProductsListingVariables({
      storeId: store.id,
      page: 1,
    });

    try {
      const productsResult = await getClient().query({
        query: ProductsDocument,
        variables: productVariables,
      });
      initialProducts = productsResult.data?.products.items;
    } catch {
      // Degrade to client-side fetch when SSR transport fails.
    }
  }

  const storefront = (
    <main className="w-full min-h-[calc(100dvh-109px)] px-4 py-4 lg:px-20">
      {store ? (
        <div className="mb-2">
          <Breadcrumbs
            items={[
              { label: 'หน้าแรก', path: '/' },
              { label: store.name, path: `/sellers/${handle}` },
            ]}
          />
        </div>
      ) : null}
      <SellerStorefront
        handle={handle}
        activeTab="products"
        initialStore={initialStore}
        initialProducts={initialProducts}
      />
    </main>
  );

  const sellerPath = `/sellers/${handle}`;
  const breadcrumbJsonLd =
    store && isSellerIndexable(store)
      ? buildBreadcrumbJsonLd([
          { name: 'หน้าแรก', url: buildAbsoluteUrl('/') },
          { name: store.name, url: buildAbsoluteUrl(sellerPath) },
        ])
      : null;

  if (!productVariables) {
    return (
      <>
        {breadcrumbJsonLd ? <JsonLdScript data={breadcrumbJsonLd} /> : null}
        <PreloadQuery query={StoreBySlugDocument} variables={storeVariables}>
          {storefront}
        </PreloadQuery>
      </>
    );
  }

  return (
    <>
      {breadcrumbJsonLd ? <JsonLdScript data={breadcrumbJsonLd} /> : null}
      <PreloadQuery query={StoreBySlugDocument} variables={storeVariables}>
        <PreloadQuery query={ProductsDocument} variables={productVariables}>
          {storefront}
        </PreloadQuery>
      </PreloadQuery>
    </>
  );
}
