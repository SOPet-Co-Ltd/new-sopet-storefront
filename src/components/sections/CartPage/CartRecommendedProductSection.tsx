'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import ProductCard from '@/components/organisms/ProductCard';
import { PRODUCT_CARD_GRID_CLASS } from '@/components/sections/ProductListing/productListingGrid';
import { RecommendedProductsDocument } from '@/lib/graphql/generated/graphql';
import { cn } from '@/lib/utils';

const PRODUCT_LIMIT = 5;

function CartRecommendedSkeletonGrid() {
  return (
    <ul className={PRODUCT_CARD_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: PRODUCT_LIMIT }).map((_, index) => (
        <li
          key={index}
          className={cn(
            'h-[280px] w-full animate-pulse rounded-sop-16px bg-sop-neutral-gray-600 md:h-[320px]',
            index === 4 && 'hidden md:block',
          )}
        />
      ))}
    </ul>
  );
}

export function CartRecommendedProductSection() {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit: PRODUCT_LIMIT },
  });

  if (loading) {
    return (
      <section className="w-full" aria-busy="true" data-testid="cart-recommended-products">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">
            <span className="lg:hidden">สินค้าแนะนำ</span>
            <span className="hidden lg:inline">สินค้าที่คุณอาจสนใจ</span>
          </h2>
        </div>
        <CartRecommendedSkeletonGrid />
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
    <section className="w-full" data-testid="cart-recommended-products">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">
          <span className="lg:hidden">สินค้าแนะนำ</span>
          <span className="hidden lg:inline">สินค้าที่คุณอาจสนใจ</span>
        </h2>
        <Link href="/recommend" className="shrink-0">
          <Button variant="secondary">
            <div className="flex items-center gap-2 px-4 py-2 md:py-0">
              <p className="text-center">ดูทั้งหมด</p>
              <RightArrowLineIcon size={{ mobile: 11, desktop: 11 }} color="#FF6F61" />
            </div>
          </Button>
        </Link>
      </div>
      <ul className={PRODUCT_CARD_GRID_CLASS}>
        {products.map((product, index) => (
          <li key={product.id} className={index === 4 ? 'hidden md:block' : undefined}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
