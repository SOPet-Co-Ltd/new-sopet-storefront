'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { EmptySearchResults } from '@/components/molecules/EmptySearchResults';
import { Pagination } from '@/components/molecules/Pagination';
import ProductCard from '@/components/organisms/ProductCard';
import { useProducts } from '@/lib/hooks/useProducts';
import { ProductListingSkeleton } from './ProductListingSkeleton';

const PRODUCT_LIMIT = 24;

export type ProductListingProps = {
  category?: string;
  search?: string;
  storeId?: string;
  tag?: string;
  heading?: string;
};

export function ProductListing({
  category,
  search,
  storeId,
  tag,
  heading,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? 1));

  const { products, total, totalPages, loading, error, refetch } = useProducts({
    category,
    search,
    storeId,
    tag,
    page: currentPage,
    limit: PRODUCT_LIMIT,
  });

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router, searchParams],
  );

  if (loading) {
    return <ProductListingSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8 text-center" data-testid="product-listing-error">
        <p className="sop-body-md-regular text-sop-neutral-gray-300 mb-4">
          โหลดสินค้าไม่สำเร็จ
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
    return <EmptySearchResults />;
  }

  return (
    <div className="py-4" data-testid="product-listing">
      <div className="flex justify-between items-center mb-6">
        <div>
          {heading && (
            <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 mb-2">{heading}</h1>
          )}
          <p className="sop-body-lg-medium text-sop-neutral-gray-300">สินค้าทั้งหมด {total}</p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(165px,1fr))] gap-2 justify-items-center md:grid-cols-[repeat(auto-fit,minmax(223px,1fr))] md:gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center md:justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
