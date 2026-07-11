'use client';

import { useQuery } from '@apollo/client/react';
import ProductCard from './ProductCard';
import {
  RecommendedProductsDocument,
  type RecommendedProductsQuery,
} from '@/lib/graphql/generated/graphql';

const RECOMMENDED_GRID_CLASS =
  'grid grid-cols-2 gap-2 justify-items-center md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-10';

export default function ThankYouRecommendedProductSection() {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit: 10 },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sop-neutral-gray-300">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return null;
  }

  const products = data?.recommendedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="sop-heading-lg-medium text-sop-neutral-gray-200 mb-6">Recommended for You</h2>
      <ul className={RECOMMENDED_GRID_CLASS}>
        {products.map((product: RecommendedProductsQuery['recommendedProducts'][number]) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
