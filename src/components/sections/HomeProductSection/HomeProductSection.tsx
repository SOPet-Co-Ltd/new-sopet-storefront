'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { RightArrowLineIcon } from '@/components/atoms/icons/filled/RightArrowLineIcon';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import { useProducts } from '@/lib/hooks/useProducts';
import ProductCard from '@/components/organisms/ProductCard';

const SECTION_HEADING_CLASS = 'mb-5 sop-body-lg-medium text-sop-neutral-gray-200';

const RESPONSIVE_GRID_COLUMNS =
  'md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-10';

const PRODUCT_GRID_CLASS = `grid grid-cols-2 gap-2 justify-items-center ${RESPONSIVE_GRID_COLUMNS}`;

const PRODUCT_CAROUSEL_CLASS = `flex gap-4 overflow-x-auto md:grid md:justify-items-center md:overflow-visible ${RESPONSIVE_GRID_COLUMNS}`;

function ProductSkeletonRow() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 md:px-0" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] w-[168px] shrink-0 rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse md:w-[223px]"
        />
      ))}
    </div>
  );
}

type HomeProductSectionProps = {
  heading?: string;
  viewAllHref?: string;
  storeId?: string;
  excludeProductId?: string;
  layout?: 'carousel' | 'grid';
};

export function HomeProductSection({
  heading = 'สินค้ามาใหม่',
  viewAllHref = '/categories',
  storeId,
  excludeProductId,
  layout = 'carousel',
}: HomeProductSectionProps) {
  const { products, loading, error } = useProducts({
    limit: 10,
    page: 1,
    storeId: storeId ?? undefined,
  });

  const visibleProducts = excludeProductId
    ? products.filter((product) => product.id !== excludeProductId)
    : products;

  if (loading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className={`md:px-0 px-4 ${SECTION_HEADING_CLASS}`}>{heading}</h2>
        <ProductSkeletonRow />
      </section>
    );
  }

  if (error || visibleProducts.length === 0) {
    return null;
  }

  const displayProducts = visibleProducts.slice(0, layout === 'grid' ? 15 : 10);

  const handleViewAllPrefetch = () => {
    prefetchProductsListing({ page: 1, limit: 10 });
  };

  return (
    <section className="w-full">
      <h2 className={`md:px-0 px-4 ${SECTION_HEADING_CLASS}`}>{heading}</h2>
      {layout === 'grid' ? (
        <div className={PRODUCT_GRID_CLASS}>
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={PRODUCT_CAROUSEL_CLASS}>
          {displayProducts.map((product) => (
            <div key={product.id} className="shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      {!storeId && (
        <div className="mt-6 flex items-center justify-center">
          <Link
            href={viewAllHref}
            onMouseEnter={handleViewAllPrefetch}
            onFocus={handleViewAllPrefetch}
          >
            <Button variant="secondary">
              <div className="flex items-center gap-2 px-4 py-2 md:py-0">
                <p className="text-center">ดูทั้งหมด</p>
                <RightArrowLineIcon size={{ mobile: 11, desktop: 11 }} color="#FF6F61" />
              </div>
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
