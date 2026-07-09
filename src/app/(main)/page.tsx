import {
  ApprovedCategoriesDocument,
  RecommendedProductsDocument,
  type ApprovedCategoriesQuery,
  type RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import {
  buildApprovedCategoriesVariables,
  buildRecommendedProductsVariables,
} from '@/lib/graphql/query-variables';
import HomePage from '@/components/pages/HomePage';

export const revalidate = 60;

const RECOMMENDED_LIMIT = 25;

export default async function Home() {
  const categoriesVariables = buildApprovedCategoriesVariables();
  const recommendedVariables = buildRecommendedProductsVariables({
    limit: RECOMMENDED_LIMIT,
  });

  let initialCategories: ApprovedCategoriesQuery['approvedCategories'] | undefined;
  let initialRecommendedProducts: RecommendedProductsQuery['recommendedProducts'] | undefined;

  try {
    const [categoriesResult, recommendedResult] = await Promise.all([
      getClient().query({
        query: ApprovedCategoriesDocument,
        variables: categoriesVariables,
      }),
      getClient().query({
        query: RecommendedProductsDocument,
        variables: recommendedVariables,
      }),
    ]);

    initialCategories = categoriesResult.data?.approvedCategories;
    initialRecommendedProducts = recommendedResult.data?.recommendedProducts;
  } catch {
    // Degrade to client-side fetch when SSR transport fails.
  }

  return (
    <PreloadQuery query={ApprovedCategoriesDocument} variables={categoriesVariables}>
      <PreloadQuery query={RecommendedProductsDocument} variables={recommendedVariables}>
        <HomePage
          initialCategories={initialCategories}
          initialRecommendedProducts={initialRecommendedProducts}
        />
      </PreloadQuery>
    </PreloadQuery>
  );
}
