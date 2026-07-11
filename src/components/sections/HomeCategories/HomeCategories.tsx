'use client';

import { type ReactNode } from 'react';
import { CategoryCard } from '@/components/molecules/CategoryCard';
import { useCategories, type Category } from '@/lib/hooks/useCategories';

const CATEGORY_GRID_CLASS = 'grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6';

function CategorySkeletonGrid() {
  return (
    <div className={CATEGORY_GRID_CLASS} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-16 w-full rounded-sop-20 bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

type CategoryListContainerProps = {
  children: ReactNode;
};

function CategoryListContainer({ children }: CategoryListContainerProps) {
  return <div className={CATEGORY_GRID_CLASS}>{children}</div>;
}

type HomeCategoriesProps = {
  heading?: string;
  initialCategories?: Category[];
};

export function HomeCategories({
  heading = 'หมวดหมู่สินค้า',
  initialCategories,
}: HomeCategoriesProps) {
  const { categories: fetchedCategories, loading, error, refetch } = useCategories();
  const categories = initialCategories ?? fetchedCategories;
  const showLoading = !initialCategories && loading;

  if (showLoading) {
    return (
      <section className="w-full" aria-busy="true">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <CategorySkeletonGrid />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          โหลดหมวดหมู่ไม่สำเร็จ — ลองอีกครั้ง
        </button>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="w-full">
        <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <p className="sop-body-sm-regular text-sop-neutral-gray-300">ไม่พบหมวดหมู่</p>
      </section>
    );
  }

  return (
    <section className="w-full">
      <h2 className="mb-5 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
      <CategoryListContainer>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </CategoryListContainer>
    </section>
  );
}
