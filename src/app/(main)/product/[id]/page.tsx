import { ProductByIdDocument, type ProductByIdQuery } from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import { buildProductByIdVariables } from '@/lib/graphql/query-variables';
import ProductDetailsPage from '@/components/sections/ProductDetailsPage';

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const variables = buildProductByIdVariables({ id });

  let initialProduct: ProductByIdQuery['product'] | undefined;

  try {
    const result = await getClient().query({
      query: ProductByIdDocument,
      variables,
    });
    initialProduct = result.data?.product;
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  return (
    <PreloadQuery query={ProductByIdDocument} variables={variables}>
      <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
        <ProductDetailsPage productId={id} initialProduct={initialProduct} />
      </main>
    </PreloadQuery>
  );
}
