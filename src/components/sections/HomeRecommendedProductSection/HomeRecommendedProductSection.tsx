'use client';

import { useQuery } from '@apollo/client/react';
import { RecommendedProductsDocument } from '@/lib/graphql/generated/graphql';
import { HomeSectionProductCard } from '@/components/sections/HomeProductSection/HomeSectionProductCard';

function RecommendedSkeletonGrid() {
  return (
    <ul
      className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-2 justify-items-center md:grid-cols-[repeat(auto-fit,minmax(223px,1fr))] md:gap-4"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="w-[168px] md:w-[223px] h-[280px] rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </ul>
  );
}

type HomeRecommendedProductSectionProps = {
  heading?: string;
  limit?: number;
};

export function HomeRecommendedProductSection({
  heading = 'สินค้าแนะนำ',
  limit = 25,
}: HomeRecommendedProductSectionProps) {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit },
  });

  if (loading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <RecommendedSkeletonGrid />
      </section>
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
    <section className="w-full">
      <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
      <div className="w-full">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-2 justify-items-center md:grid-cols-[repeat(auto-fit,minmax(223px,1fr))] md:gap-4">
          {products.map((product) => (
            <li key={product.id}>
              <HomeSectionProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
