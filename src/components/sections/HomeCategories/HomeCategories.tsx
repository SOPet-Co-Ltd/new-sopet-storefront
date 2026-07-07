'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useCategories, type Category } from '@/lib/hooks/useCategories';

const PLACEHOLDER_IMAGE = '/images/placeholder.svg';
const CATEGORY_GRID_CLASS = 'grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-6';

type CategoryCardProps = {
  category: Category;
};

function CategoryCard({ category }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc =
    !imageError && category.imageUrl ? category.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex h-16 w-full flex-row items-center overflow-hidden rounded-sop-20 border border-sop-additionalblue-200 bg-sop-additionalblue-100 px-5 py-3 transition-opacity hover:opacity-90"
      aria-label={`ดูหมวดหมู่ ${category.name}`}
    >
      <span className="min-w-0 flex-1 sop-body-sm-medium text-sop-neutral-gray-200 line-clamp-2">
        {category.name}
      </span>
      <div className="relative h-full w-[40%] shrink-0">
        <Image
          loading="lazy"
          src={imageSrc}
          alt={`หมวดหมู่ - ${category.name}`}
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
          className="object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    </Link>
  );
}

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
};

export function HomeCategories({ heading = 'หมวดหมู่สินค้า' }: HomeCategoriesProps) {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
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
