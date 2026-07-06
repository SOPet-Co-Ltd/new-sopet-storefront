'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCategories, type Category } from '@/lib/hooks/useCategories';

type CategoryCardProps = {
  category: Category;
};

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="relative flex flex-col items-center border rounded-xs bg-component transition-all hover:rounded-full w-[233px] aspect-square"
      aria-label={`ดูหมวดหมู่ ${category.name}`}
    >
      <div className="flex relative aspect-square overflow-hidden w-[200px]">
        <Image
          loading="lazy"
          src="/images/placeholder.svg"
          alt={`หมวดหมู่ - ${category.name}`}
          width={200}
          height={200}
          sizes="(min-width: 1024px) 200px, 40vw"
          className="object-contain scale-90 rounded-full"
        />
      </div>
      <h3 className="w-full text-center label-lg text-primary">{category.name}</h3>
    </Link>
  );
}

function CategorySkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[233px] rounded-xs bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

type HomeCategoriesProps = {
  heading?: string;
};

export function HomeCategories({ heading = 'หมวดหมู่สินค้า' }: HomeCategoriesProps) {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
    return (
      <section className="w-full py-8" aria-busy="true">
        <h2 className="mb-6 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <CategorySkeletonGrid />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-8">
        <h2 className="mb-6 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
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
      <section className="w-full py-8">
        <h2 className="mb-6 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
        <p className="sop-body-sm-regular text-sop-neutral-gray-300">ไม่พบหมวดหมู่</p>
      </section>
    );
  }

  return (
    <section className="w-full py-8">
      <h2 className="mb-6 sop-body-lg-medium text-sop-neutral-gray-200">{heading}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
