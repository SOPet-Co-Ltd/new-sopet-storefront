'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import { useProducts } from '@/lib/hooks/useProducts';
import { HomeSectionProductCard } from './HomeSectionProductCard';

function ProductSkeletonRow() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 md:px-0" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="shrink-0 w-[168px] md:w-[223px] h-[280px] rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

type HomeProductSectionProps = {
  heading?: string;
  viewAllHref?: string;
};

export function HomeProductSection({
  heading = 'สินค้ามาใหม่',
  viewAllHref = '/categories',
}: HomeProductSectionProps) {
  const { products, loading, error } = useProducts({ limit: 10, page: 1 });

  if (loading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className="md:px-0 px-4 md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-500 mb-5 border-b border-sop-primary-500 pb-2">
          {heading}
        </h2>
        <ProductSkeletonRow />
      </section>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <h2 className="md:px-0 px-4 md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-500 mb-5 border-b border-sop-primary-500 pb-2">
        {heading}
      </h2>
      <div className="flex gap-1 overflow-x-auto lg:grid md:grid-cols-5 md:gap-4 lg:px-0 px-4">
        {products.map((product) => (
          <div key={product.id} className="shrink-0 md:w-auto flex">
            <HomeSectionProductCard product={product} />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-6">
        <Link href={viewAllHref}>
          <Button variant="secondary">
            <div className="px-4 flex items-center gap-2 py-2 md:py-0">
              <p className="text-center">ดูทั้งหมด</p>
              <RightArrowLineIcon size={{ mobile: 11, desktop: 11 }} color="#FF6F61" />
            </div>
          </Button>
        </Link>
      </div>
    </section>
  );
}
