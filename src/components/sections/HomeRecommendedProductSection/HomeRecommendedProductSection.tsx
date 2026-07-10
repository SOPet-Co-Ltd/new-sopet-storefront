'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import { RecommendedProductsDocument, type RecommendedProductsQuery } from '@/lib/graphql/generated/graphql';
import ProductCard from '@/components/organisms/ProductCard';
import { PRODUCT_CARD_GRID_CLASS } from '@/components/sections/ProductListing/productListingGrid';

const SECTION_HEADING_CLASS = 'mb-5 sop-body-lg-medium text-sop-neutral-gray-200';

function RecommendedSkeletonGrid() {
  return (
    <ul className={PRODUCT_CARD_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
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
  viewAllHref?: string;
  initialRecommendedProducts?: RecommendedProductsQuery['recommendedProducts'];
};

export function HomeRecommendedProductSection({
  heading = 'สินค้าแนะนำ',
  limit = 25,
  viewAllHref = '/categories',
  initialRecommendedProducts,
}: HomeRecommendedProductSectionProps) {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit },
  });

  const products = initialRecommendedProducts ?? data?.recommendedProducts ?? [];
  const showLoading = !initialRecommendedProducts && loading;

  if (showLoading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className={SECTION_HEADING_CLASS}>{heading}</h2>
        <RecommendedSkeletonGrid />
      </section>
    );
  }

  if (error && !initialRecommendedProducts) {
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <h2 className={SECTION_HEADING_CLASS}>{heading}</h2>
      <div className="w-full">
        <ul className={PRODUCT_CARD_GRID_CLASS}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <Link href={viewAllHref}>
          <Button variant="outline">
            <div className="flex items-center gap-2 px-4 py-2 md:py-0">
              <p className="text-center">ดูสินค้าทั้งหมด</p>
              <RightArrowLineIcon size={{ mobile: 11, desktop: 11 }} color="#FF6F61" />
            </div>
          </Button>
        </Link>
      </div>
    </section>
  );
}
