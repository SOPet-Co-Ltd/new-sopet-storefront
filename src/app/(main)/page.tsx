import type { Metadata } from 'next';

import HomePage from '@/components/pages/HomePage';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { getClient } from '@/lib/graphql/apollo-rsc';
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
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld';
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

  const preload = await runSsrPreloadQueries('home', async () => {
    const [categoriesResult, recommendedResult] = await Promise.all([
      getClient().query({
        query: ApprovedCategoriesDocument,
        variables: categoriesVariables,
        errorPolicy: 'all',
      }),
      getClient().query({
        query: RecommendedProductsDocument,
        variables: recommendedVariables,
        errorPolicy: 'all',
      }),
    ]);

    return {
      categories: categoriesResult.data?.approvedCategories,
      recommendedProducts: recommendedResult.data?.recommendedProducts,
    };
  });

  if (preload.ok) {
    initialCategories = preload.data.categories;
    initialRecommendedProducts = preload.data.recommendedProducts;
  }

  const siteConfig = getSiteConfig();
  const organizationJsonLd = buildOrganizationJsonLd(siteConfig);
  const webSiteJsonLd = buildWebSiteJsonLd(siteConfig);

  return (
    <>
      <JsonLdScript data={[organizationJsonLd, webSiteJsonLd]} />
      <HomePage
        initialCategories={initialCategories}
        initialRecommendedProducts={initialRecommendedProducts}
      />
    </>
  );
}
