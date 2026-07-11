'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import ProductCard from '@/components/organisms/ProductCard';
import { PRODUCT_CARD_GRID_CLASS } from '@/components/sections/ProductListing/productListingGrid';
import {
  RecommendedProductsDocument,
  type RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';
import { buildRecommendedProductsVariables } from '@/lib/graphql/query-variables';
import { buildSearchContextInput, useSearchContext } from '@/lib/hooks/useSearchContext';
import { useSessionId } from '@/lib/hooks/useSessionId';

const RECOMMEND_PAGE_LIMIT = 48;

type RecommendProductListingProps = {
  shuffleSeed: string;
  fromProductId?: string;
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
};

function RecommendSkeletonGrid() {
  return (
    <ul className={PRODUCT_CARD_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <li
          key={index}
          className="h-[280px] w-[168px] animate-pulse rounded-sop-16px bg-sop-neutral-gray-600 md:w-[223px]"
        />
      ))}
    </ul>
  );
}

export function RecommendProductListing({
  shuffleSeed,
  fromProductId,
  initialRecommendedProducts,
}: RecommendProductListingProps) {
  const sessionId = useSessionId(true);
  const sessionSearchContext = useSearchContext();
  const searchContext = useMemo(
    () =>
      buildSearchContextInput({
        recentQueries: sessionSearchContext?.recentQueries ?? [],
        recentProductIds: fromProductId
          ? [fromProductId, ...(sessionSearchContext?.recentProductIds ?? [])]
          : (sessionSearchContext?.recentProductIds ?? []),
      }),
    [fromProductId, sessionSearchContext],
  );
  const variables = useMemo(
    () =>
      buildRecommendedProductsVariables({
        limit: RECOMMEND_PAGE_LIMIT,
        sessionId,
        searchContext,
        excludeProductIds: fromProductId ? [fromProductId] : undefined,
        shuffleSeed,
      }),
    [sessionId, searchContext, fromProductId, shuffleSeed],
  );
  const { data, loading, error, refetch } = useQuery(RecommendedProductsDocument, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const products = data?.recommendedProducts ?? initialRecommendedProducts ?? [];
  const showLoading = !initialRecommendedProducts && loading;

  if (showLoading) {
    return <RecommendSkeletonGrid />;
  }

  if (error && !initialRecommendedProducts) {
    return (
      <div className="py-8 text-center" data-testid="recommend-listing-error">
        <p className="sop-body-md-regular mb-4 text-sop-neutral-gray-300">
          โหลดสินค้าแนะนำไม่สำเร็จ
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="py-8 text-center sop-body-md-regular text-sop-neutral-gray-300">
        ยังไม่มีสินค้าแนะนำในขณะนี้
      </p>
    );
  }

  return (
    <div data-testid="recommend-listing">
      <p className="sop-body-lg-medium text-sop-neutral-gray-200">
        สินค้าแนะนำสำหรับคุณ ({products.length})
      </p>
      <ul className={`mt-6 ${PRODUCT_CARD_GRID_CLASS}`}>
        {products.map((product, index) => (
          <li key={product.id} className="flex min-w-0 justify-center">
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
