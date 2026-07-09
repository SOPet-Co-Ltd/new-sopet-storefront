import {
  ProductsDocument,
  type ProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';
import { CategoryPLP } from '@/components/sections/ProductListing';

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const variables = buildProductsListingVariables({ category, page: 1 });

  let initialProducts: ProductsQuery['products']['items'] | undefined;

  try {
    const result = await getClient().query({
      query: ProductsDocument,
      variables,
    });
    initialProducts = result.data?.products.items;
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  return (
    <PreloadQuery query={ProductsDocument} variables={variables}>
      <main className="container lg:px-20 px-4 py-4">
        <CategoryPLP categorySlug={category} initialProducts={initialProducts} />
      </main>
    </PreloadQuery>
  );
}
