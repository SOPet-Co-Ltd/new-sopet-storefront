import { randomUUID } from 'node:crypto';
import {
  RecommendedProductsDocument,
  type RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import { buildRecommendedProductsVariables } from '@/lib/graphql/query-variables';
import { RecommendProductListing } from '@/components/sections/RecommendProductListing';

export const revalidate = 0;

const RECOMMEND_PAGE_LIMIT = 48;

type Props = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function RecommendPage({ searchParams }: Props) {
  const { from } = await searchParams;
  const shuffleSeed = randomUUID();
  const variables = buildRecommendedProductsVariables({
    limit: RECOMMEND_PAGE_LIMIT,
    excludeProductIds: from ? [from] : undefined,
    shuffleSeed,
  });

  let initialRecommendedProducts: RecommendedProductsQuery['recommendedProducts'] | undefined;

  try {
    const result = await getClient().query({
      query: RecommendedProductsDocument,
      variables,
    });
    initialRecommendedProducts = result.data?.recommendedProducts;
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  return (
    <PreloadQuery query={RecommendedProductsDocument} variables={variables}>
      <main className="w-full min-h-[calc(100dvh-109px)] px-4 py-4 lg:px-20">
        <h1 className="sop-headline-md-medium uppercase text-sop-neutral-gray-300">
          สินค้าแนะนำสำหรับคุณ
        </h1>
        <div className="mt-6">
          <RecommendProductListing
            shuffleSeed={shuffleSeed}
            fromProductId={from}
            initialRecommendedProducts={initialRecommendedProducts}
          />
        </div>
      </main>
    </PreloadQuery>
  );
}
