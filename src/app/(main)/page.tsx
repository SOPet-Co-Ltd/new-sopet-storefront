import type { Metadata } from 'next';

import HomePage from '@/components/pages/HomePage';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { getClient, PreloadQuery } from '@/lib/graphql/apollo-rsc';
import {
  ApprovedCategoriesDocument,
  RecommendedProductsDocument,
  type ApprovedCategoriesQuery,
  type RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';
import {
  buildApprovedCategoriesVariables,
  buildRecommendedProductsVariables,
} from '@/lib/graphql/query-variables';
import { buildOrganizationJsonLd } from '@/lib/seo/json-ld';
import { buildHomeMetadata, getSiteConfig } from '@/lib/seo/metadata';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildHomeMetadata();
}

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

  const organizationJsonLd = buildOrganizationJsonLd(getSiteConfig());

  return (
    <>
      <JsonLdScript data={organizationJsonLd} />
      <PreloadQuery query={ApprovedCategoriesDocument} variables={categoriesVariables}>
        <PreloadQuery query={RecommendedProductsDocument} variables={recommendedVariables}>
          <HomePage
            initialCategories={initialCategories}
            initialRecommendedProducts={initialRecommendedProducts}
          />
        </PreloadQuery>
      </PreloadQuery>
    </>
  );
}
