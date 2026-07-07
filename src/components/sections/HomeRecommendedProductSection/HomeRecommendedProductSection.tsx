'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import { RecommendedProductsDocument } from '@/lib/graphql/generated/graphql';
import ProductCard from '@/components/organisms/ProductCard';

const RECOMMENDED_GRID_CLASS =
  'grid grid-cols-2 gap-2 justify-items-center md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-10';

const SECTION_HEADING_CLASS = 'mb-5 sop-body-lg-medium text-sop-neutral-gray-200';

function RecommendedSkeletonGrid() {
  return (
    <ul className={RECOMMENDED_GRID_CLASS} aria-hidden="true">
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
};

export function HomeRecommendedProductSection({
  heading = 'สินค้าแนะนำ',
  limit = 25,
  viewAllHref = '/categories',
}: HomeRecommendedProductSectionProps) {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit },
  });

  if (loading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className={SECTION_HEADING_CLASS}>{heading}</h2>
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
      <h2 className={SECTION_HEADING_CLASS}>{heading}</h2>
      <div className="w-full">
        <ul className={RECOMMENDED_GRID_CLASS}>
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
