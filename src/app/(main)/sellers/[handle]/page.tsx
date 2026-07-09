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

export const revalidate = 60;

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function SellerPage({ params }: Props) {
  const { handle } = await params;
  const storeVariables = buildSellerStorefrontVariables({ handle });

  let initialStore: StoreBySlugQuery['storeBySlug'] | undefined;
  let initialProducts: ProductsQuery['products']['items'] | undefined;
  let productVariables: ReturnType<typeof buildProductsListingVariables> | null = null;

  try {
    const storeResult = await getClient().query({
      query: StoreBySlugDocument,
      variables: storeVariables,
    });
    initialStore = storeResult.data?.storeBySlug;

    if (initialStore?.id) {
      productVariables = buildProductsListingVariables({
        storeId: initialStore.id,
        page: 1,
      });
      const productsResult = await getClient().query({
        query: ProductsDocument,
        variables: productVariables,
      });
      initialProducts = productsResult.data?.products.items;
    }
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  const storefront = (
    <main className="container lg:px-20 px-4 py-4">
      <SellerStorefront
        handle={handle}
        activeTab="products"
        initialStore={initialStore}
        initialProducts={initialProducts}
      />
    </main>
  );

  if (!productVariables) {
    return (
      <PreloadQuery query={StoreBySlugDocument} variables={storeVariables}>
        {storefront}
      </PreloadQuery>
    );
  }

  return (
    <PreloadQuery query={StoreBySlugDocument} variables={storeVariables}>
      <PreloadQuery query={ProductsDocument} variables={productVariables}>
        {storefront}
      </PreloadQuery>
    </PreloadQuery>
  );
}
