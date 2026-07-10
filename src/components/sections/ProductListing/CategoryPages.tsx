'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import type { ProductsQuery } from '@/lib/graphql/generated/graphql';
import {
  buildCategoryHref,
  resolveCategoryBySlug,
  resolveCategoryFilterName,
} from '@/lib/routing/categoryRoutes';
import { prefetchProductsListing } from '@/lib/catalog/prefetchProductsListing';
import { ProductListing } from './ProductListing';
import { ProductListingSkeleton } from './ProductListingSkeleton';

type CategoryPLPProps = {
  categorySlug: string;
  categoryFilter?: string;
  initialProducts?: ProductsQuery['products']['items'];
  initialPage?: number;
};

function CategoryHeader({ categorySlug }: { categorySlug: string }) {
  const { categories, loading } = useCategories();
  const category = resolveCategoryBySlug(categories, categorySlug);
  const title = loading ? categorySlug : (category?.name ?? categorySlug);

  return (
    <div className="mb-4">
      <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 uppercase">{title}</h1>
    </div>
  );
}

export function CategoryPLP({
  categorySlug,
  categoryFilter: initialCategoryFilter,
  initialProducts,
  initialPage,
}: CategoryPLPProps) {
  const { categories, loading } = useCategories();
  const categoryFilter =
    loading && initialCategoryFilter
      ? initialCategoryFilter
      : resolveCategoryFilterName(categories, categorySlug);

  return (
    <>
      <CategoryHeader categorySlug={categorySlug} />
      <Suspense fallback={<ProductListingSkeleton />}>
        <ProductListing
          category={categoryFilter}
          initialProducts={initialProducts}
          initialPage={initialPage}
        />
      </Suspense>
    </>
  );
}

function CategoryCard({ name, slug }: { name: string; slug: string }) {
  const handlePrefetch = () => {
    prefetchProductsListing({ category: name, page: 1 });
  };

  return (
    <Link
      href={buildCategoryHref(slug)}
      className="relative flex flex-col items-center border rounded-xs bg-component transition-all hover:rounded-full w-full max-w-[233px] aspect-square"
      aria-label={`ดูหมวดหมู่ ${name}`}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div className="flex relative aspect-square overflow-hidden w-[200px]">
        <Image
          loading="lazy"
          src="/images/placeholder.svg"
          alt={`หมวดหมู่ - ${name}`}
          width={200}
          height={200}
          sizes="(min-width: 1024px) 200px, 40vw"
          className="object-contain scale-90 rounded-full"
        />
      </div>
      <h3 className="w-full text-center label-lg text-primary">{name}</h3>
    </Link>
  );
}

function CategoryIndexSkeleton() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
      aria-hidden="true"
      data-testid="category-index-skeleton"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[233px] rounded-xs bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

export function CategoryIndexPage() {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
    return (
      <main className="w-full px-4 py-8 lg:px-20" aria-busy="true">
        <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 mb-6">หมวดหมู่สินค้า</h1>
        <CategoryIndexSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full px-4 py-8 lg:px-20">
        <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 mb-6">หมวดหมู่สินค้า</h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          โหลดหมวดหมู่ไม่สำเร็จ — ลองอีกครั้ง
        </button>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-8 lg:px-20" data-testid="category-index-page">
      <h1 className="sop-headline-md-medium text-sop-neutral-gray-300 mb-6">หมวดหมู่สินค้า</h1>
      {categories.length === 0 ? (
        <p className="sop-body-sm-regular text-sop-neutral-gray-300">ไม่พบหมวดหมู่</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          {categories.map((category) => (
            <CategoryCard key={category.id} name={category.name} slug={category.slug} />
          ))}
        </div>
      )}
    </main>
  );
}
